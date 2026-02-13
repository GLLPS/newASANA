import { Injectable, Inject, BadRequestException } from '@nestjs/common';
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
    const inspection = await this.inspectionService.findOne(tenantId, inspectionId);

    if (dto.submitType === 'Draft') {
      return this.submitDraft(tenantId, inspection, userId);
    } else {
      return this.submitFinal(tenantId, inspection, userId, dto);
    }
  }

  private async submitDraft(tenantId: string, inspection: any, userId: string) {
    // Generate Word document (stub)
    const docBuffer = Buffer.from('STUB WORD DOCUMENT');
    console.log(`[InspectionSubmit] Generated draft Word document for inspection ${inspection.id}`);

    // Email submitter only (stub)
    const submitter = await this.prisma.user.findUnique({ where: { id: userId } });
    if (submitter) {
      await this.emailService.sendEmail(tenantId, {
        to: [submitter.email],
        subject: `Draft Inspection Report - ${inspection.id}`,
        body: 'Your draft inspection report is attached.',
        attachments: [{ filename: 'draft-report.docx', content: docBuffer }],
      });
    }

    // No time prompt for drafts
    return { status: 'Draft', inspectionId: inspection.id, message: 'Draft saved and emailed to submitter.' };
  }

  private async submitFinal(tenantId: string, inspection: any, userId: string, dto: SubmitInspectionDto) {
    // Check required items - findings with requiredOverride
    const findings = await this.prisma.finding.findMany({
      where: { tenantId, inspectionId: inspection.id },
    });

    // Log time entry (stub)
    if (dto.timeEntry) {
      await this.bigTimeService.logTime(tenantId, {
        projectId: inspection.bigtimeProjectId,
        userId,
        hours: dto.timeEntry,
        date: new Date().toISOString(),
        note: `Inspection ${inspection.id}`,
      });
    }

    // Generate PDF (stub)
    const pdfBuffer = Buffer.from('STUB PDF DOCUMENT');
    console.log(`[InspectionSubmit] Generated final PDF for inspection ${inspection.id}`);

    // Email selected client contacts
    if (dto.contactEmails && dto.contactEmails.length > 0) {
      await this.emailService.sendEmail(tenantId, {
        to: dto.contactEmails,
        subject: `Final Inspection Report - ${inspection.id}`,
        body: 'The final inspection report is attached.',
        attachments: [{ filename: 'inspection-report.pdf', content: pdfBuffer }],
      });
    }

    // Upload to SharePoint (stub)
    const bigtimeProject = await this.prisma.bigTimeProject.findUnique({
      where: { id: inspection.bigtimeProjectId },
    });
    const folderId = bigtimeProject?.sharepointFolderId ?? null;
    await this.sharePointService.uploadDocument(
      tenantId,
      folderId,
      `inspection-${inspection.id}.pdf`,
      pdfBuffer,
    );

    // Create corrective actions for Issue findings
    const issueFindings = findings.filter(f => f.status === 'Issue');
    for (const finding of issueFindings) {
      await this.prisma.action.create({
        data: {
          tenantId,
          clientId: bigtimeProject!.clientId,
          siteId: inspection.siteId,
          inspectionId: inspection.id,
          findingId: finding.id,
          description: `Corrective action for ${finding.category} - ${finding.riskType}`,
          responsibleName: 'TBD',
          dueDate: new Date(Date.now() + 14 * 86400000), // 14 days from now
          status: 'Open',
        },
      });
    }

    // Mark inspection as Final
    await this.prisma.inspection.update({
      where: { id: inspection.id },
      data: { status: 'Final', submittedAt: new Date() },
    });

    return {
      status: 'Final',
      inspectionId: inspection.id,
      actionsCreated: issueFindings.length,
      message: 'Inspection finalized, report generated, and actions created.',
    };
  }
}
