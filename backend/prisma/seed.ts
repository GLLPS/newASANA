import { PrismaClient, UserRole, WorkItemType, ReportType, InspectionStatus, FindingStatus, Severity, RiskType, ActionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ---------------------------------------------------------------------------
  // Clean existing data in reverse-dependency order
  // ---------------------------------------------------------------------------
  await prisma.actionAuditLog.deleteMany();
  await prisma.action.deleteMany();
  await prisma.finding.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.workItem.deleteMany();
  await prisma.site.deleteMany();
  await prisma.bigTimeProject.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // ---------------------------------------------------------------------------
  // 1. Tenant
  // ---------------------------------------------------------------------------
  const tenant = await prisma.tenant.create({
    data: { name: 'Great Lakes Environmental' },
  });

  const tenantId = tenant.id;

  // ---------------------------------------------------------------------------
  // 2. Users
  // ---------------------------------------------------------------------------
  const passwordHash = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      tenantId,
      email: 'admin@greatlakes.com',
      passwordHash,
      role: UserRole.Admin,
    },
  });

  const inspectorUser = await prisma.user.create({
    data: {
      tenantId,
      email: 'inspector@greatlakes.com',
      passwordHash,
      role: UserRole.Staff,
    },
  });

  // ---------------------------------------------------------------------------
  // 3. Clients
  // ---------------------------------------------------------------------------
  const acme = await prisma.client.create({
    data: {
      tenantId,
      name: 'Acme Construction',
      weeklySummaryEnabled: true,
    },
  });

  const safeBuild = await prisma.client.create({
    data: {
      tenantId,
      name: 'SafeBuild Industries',
      weeklySummaryEnabled: false,
    },
  });

  // ---------------------------------------------------------------------------
  // 4. Contacts
  // ---------------------------------------------------------------------------
  await prisma.contact.create({
    data: {
      tenantId,
      clientId: acme.id,
      name: 'Roger Smith',
      email: 'roger@acme.com',
      receiveInspectionsDefault: true,
    },
  });

  await prisma.contact.create({
    data: {
      tenantId,
      clientId: acme.id,
      name: 'Jane Miller',
      email: 'jane@acme.com',
      receiveInspectionsDefault: false,
    },
  });

  await prisma.contact.create({
    data: {
      tenantId,
      clientId: safeBuild.id,
      name: 'Tom Davis',
      email: 'tom@safebuild.com',
      receiveInspectionsDefault: true,
    },
  });

  // ---------------------------------------------------------------------------
  // 5. BigTimeProjects
  // ---------------------------------------------------------------------------
  const acmeBtProject = await prisma.bigTimeProject.create({
    data: {
      tenantId,
      clientId: acme.id,
      bigtimeProjectId: 'BT-001',
      sharepointFolderId: 'SP-ACME-001',
    },
  });

  const safeBuildBtProject = await prisma.bigTimeProject.create({
    data: {
      tenantId,
      clientId: safeBuild.id,
      bigtimeProjectId: 'BT-002',
      sharepointFolderId: null,
    },
  });

  // ---------------------------------------------------------------------------
  // 6. Sites
  // ---------------------------------------------------------------------------
  const downtownTower = await prisma.site.create({
    data: {
      tenantId,
      clientId: acme.id,
      name: 'Downtown Tower Project',
    },
  });

  const highwayBridge = await prisma.site.create({
    data: {
      tenantId,
      clientId: acme.id,
      name: 'Highway Bridge Site',
    },
  });

  const warehouseReno = await prisma.site.create({
    data: {
      tenantId,
      clientId: safeBuild.id,
      name: 'Warehouse Renovation',
    },
  });

  // ---------------------------------------------------------------------------
  // 7. WorkItems
  // ---------------------------------------------------------------------------
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const workItemInspection = await prisma.workItem.create({
    data: {
      tenantId,
      externalSource: 'BigTime',
      externalId: 'EXT-001',
      type: WorkItemType.Inspection,
      clientId: acme.id,
      bigtimeProjectId: acmeBtProject.id,
      siteId: downtownTower.id,
      assignedToUserId: inspectorUser.id,
      scheduledDate: today,
    },
  });

  const workItemTraining = await prisma.workItem.create({
    data: {
      tenantId,
      externalSource: 'BigTime',
      externalId: 'EXT-002',
      type: WorkItemType.Training,
      clientId: acme.id,
      bigtimeProjectId: acmeBtProject.id,
      siteId: highwayBridge.id,
      assignedToUserId: inspectorUser.id,
      scheduledDate: tomorrow,
    },
  });

  const workItemInspection2 = await prisma.workItem.create({
    data: {
      tenantId,
      externalSource: 'BigTime',
      externalId: 'EXT-003',
      type: WorkItemType.Inspection,
      clientId: safeBuild.id,
      bigtimeProjectId: safeBuildBtProject.id,
      siteId: warehouseReno.id,
      assignedToUserId: inspectorUser.id,
      scheduledDate: dayAfterTomorrow,
    },
  });

  // ---------------------------------------------------------------------------
  // 8. Inspection (Draft, linked to first work item)
  // ---------------------------------------------------------------------------
  const inspection = await prisma.inspection.create({
    data: {
      tenantId,
      workItemId: workItemInspection.id,
      bigtimeProjectId: acmeBtProject.id,
      siteId: downtownTower.id,
      reportType: ReportType.StandardPDF,
      status: InspectionStatus.Draft,
    },
  });

  // ---------------------------------------------------------------------------
  // 9. Findings
  // ---------------------------------------------------------------------------
  const findingFallProtection = await prisma.finding.create({
    data: {
      tenantId,
      inspectionId: inspection.id,
      category: 'Fall Protection',
      status: FindingStatus.Issue,
      severity: Severity.High,
      riskType: RiskType.OSHA,
      oshaRef: '1926.501',
    },
  });

  const findingHousekeeping = await prisma.finding.create({
    data: {
      tenantId,
      inspectionId: inspection.id,
      category: 'Housekeeping',
      status: FindingStatus.Positive,
      severity: Severity.Low,
      riskType: RiskType.Behavioral,
    },
  });

  const findingElectrical = await prisma.finding.create({
    data: {
      tenantId,
      inspectionId: inspection.id,
      category: 'Electrical',
      status: FindingStatus.Issue,
      severity: Severity.Medium,
      riskType: RiskType.Equipment,
    },
  });

  // ---------------------------------------------------------------------------
  // 10. Actions (one per Issue finding)
  // ---------------------------------------------------------------------------
  const dueDateFallProtection = new Date(today);
  dueDateFallProtection.setDate(dueDateFallProtection.getDate() + 7);

  const dueDateElectrical = new Date(today);
  dueDateElectrical.setDate(dueDateElectrical.getDate() + 14);

  await prisma.action.create({
    data: {
      tenantId,
      clientId: acme.id,
      siteId: downtownTower.id,
      inspectionId: inspection.id,
      findingId: findingFallProtection.id,
      description: 'Install guardrails on all open-sided floors above 6 feet per OSHA 1926.501',
      responsibleName: 'Roger Smith',
      responsibleEmail: 'roger@acme.com',
      dueDate: dueDateFallProtection,
      status: ActionStatus.Open,
    },
  });

  await prisma.action.create({
    data: {
      tenantId,
      clientId: acme.id,
      siteId: downtownTower.id,
      inspectionId: inspection.id,
      findingId: findingElectrical.id,
      description: 'Replace damaged extension cords and verify GFCI protection on all temporary wiring',
      responsibleName: 'Roger Smith',
      responsibleEmail: 'roger@acme.com',
      dueDate: dueDateElectrical,
      status: ActionStatus.Open,
    },
  });

  console.log('Seed data created successfully.');
  console.log(`  Tenant: ${tenant.name} (${tenant.id})`);
  console.log(`  Users: ${adminUser.email}, ${inspectorUser.email}`);
  console.log(`  Clients: ${acme.name}, ${safeBuild.name}`);
  console.log(`  Sites: ${downtownTower.name}, ${highwayBridge.name}, ${warehouseReno.name}`);
  console.log(`  WorkItems: 3`);
  console.log(`  Inspection: ${inspection.id} (${inspection.status})`);
  console.log(`  Findings: 3`);
  console.log(`  Actions: 2`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
