import { Injectable, Inject, HttpException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InspectionService } from './inspection.service';
import { IEmailService } from '../../integrations/email.service';
import { ISharePointService } from '../../integrations/sharepoint.service';
import { IBigTimeService } from '../../integrations/bigtime.service';
import { SubmitInspectionDto } from './dto/submit-inspection.dto';

@Injectable()
export class InspectionSubmitService {
  constructor(
    private prisma: PrismaService,
    private inspectionService: InspectionService,
    @Inject('IEmailService') private emailService: IEmailService,
    @Inject('ISharePointService') private sharePointService: ISharePointService,
    @Inject('IBigTimeService') private bigTimeService: IBigTimeService,
  ) {}

  async submit(tenantId: string, inspectionId: string, userId: string, dto: SubmitInspectionDto) {
    try {
      const inspection = await this.inspectionService.findOne(tenantId, inspectionId);

      if (dto.submitType === 'Draft') {
        return await this.submitDraft(tenantId, inspection, userId);
      } else {
        return await this.submitFinal(tenantId, inspection, userId, dto);
      }
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error('[InspectionSubmit] Unhandled error during submission:', err);
      throw new InternalServerErrorException(
        `Submission failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private async submitDraft(tenantId: string, inspection: any, userId: string) {
    const docBuffer = Buffer.from('STUB WORD DOCUMENT');
    console.log(`[InspectionSubmit] Generated draft Word document for inspection ${inspection.id}`);

    const submitter = await this.prisma.user.findUnique({ where: { id: userId } });
    if (submitter) {
      await this.emailService.sendEmail(tenantId, {
        to: [submitter.email],
        subject: `Draft Inspection Report - ${inspection.id}`,
        body: 'Your draft inspection report is attached.',
        attachments: [{ filename: 'draft-report.docx', content: docBuffer }],
      });
    }

    return { status: 'Draft', inspectionId: inspection.id, message: 'Draft saved and emailed to submitter.' };
  }

  private async submitFinal(tenantId: string, inspection: any, userId: string, dto: SubmitInspectionDto) {
    const findings = await this.prisma.finding.findMany({
      where: { tenantId, inspectionId: inspection.id },
    });

    // Log time entry - non-blocking
    if (dto.timeEntry) {
      try {
        await this.bigTimeService.logTime(tenantId, {
          projectId: inspection.bigtimeProjectId,
          userId,
          hours: dto.timeEntry,
          date: new Date().toISOString(),
          note: `Inspection ${inspection.id}`,
        });
      } catch (err) {
        console.warn('[InspectionSubmit] Time entry logging failed (non-blocking):', err);
      }
    }

    // Generate PDF (stub)
    const pdfBuffer = Buffer.from('STUB PDF DOCUMENT');
    console.log(`[InspectionSubmit] Generated final PDF for inspection ${inspection.id}`);

    // Email selected client contacts - non-blocking
    if (dto.contactEmails && dto.contactEmails.length > 0) {
      try {
        await this.emailService.sendEmail(tenantId, {
          to: dto.contactEmails,
          subject: `Final Inspection Report - ${inspection.id}`,
          body: 'The final inspection report is attached.',
          attachments: [{ filename: 'inspection-report.pdf', content: pdfBuffer }],
        });
      } catch (err) {
        console.warn('[InspectionSubmit] Email send failed (non-blocking):', err);
      }
    }

    // Upload to SharePoint - non-blocking
    let bigtimeProject: { id: string; clientId: string; sharepointFolderId: string | null } | null = null;
    try {
      bigtimeProject = await this.prisma.bigTimeProject.findUnique({
        where: { id: inspection.bigtimeProjectId },
        select: { id: true, clientId: true, sharepointFolderId: true },
      });
    } catch (err) {
      console.warn('[InspectionSubmit] BigTimeProject lookup failed:', err);
    }

    if (bigtimeProject) {
      try {
        await this.sharePointService.uploadDocument(
          tenantId,
          bigtimeProject.sharepointFolderId ?? null,
          `inspection-${inspection.id}.pdf`,
          pdfBuffer,
        );
      } catch (err) {
        console.warn('[InspectionSubmit] SharePoint upload failed (non-blocking):', err);
      }
    }

    // Create corrective actions for Issue findings
    const issueFindings = findings.filter(f => f.status === 'Issue');
    const clientId = bigtimeProject?.clientId;
    let actionsCreated = 0;

    if (clientId) {
      for (const finding of issueFindings) {
        try {
          await this.prisma.action.create({
            data: {
              tenantId,
              clientId,
              siteId: inspection.siteId,
              inspectionId: inspection.id,
              findingId: finding.id,
              description: `Corrective action for ${finding.category} - ${finding.riskType}`,
              responsibleName: 'TBD',
              dueDate: new Date(Date.now() + 14 * 86400000),
              status: 'Open',
            },
          });
          actionsCreated++;
        } catch (err) {
          console.warn(`[InspectionSubmit] Action creation failed for finding ${finding.id}:`, err);
        }
      }
    }

    // Mark inspection as Final
    await this.prisma.inspection.update({
      where: { id: inspection.id },
      data: { status: 'Final', submittedAt: new Date() },
    });

    return {
      status: 'Final',
      inspectionId: inspection.id,
      actionsCreated,
      message: 'Inspection finalized, report generated, and actions created.',
    };
  }
}
