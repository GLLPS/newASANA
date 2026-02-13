export interface ISharePointService {
  uploadDocument(
    tenantId: string,
    folderId: string | null,
    fileName: string,
    content: Buffer,
  ): Promise<{ success: boolean; fileUrl: string }>;
  getFolderContents(tenantId: string, folderId: string): Promise<{ name: string; url: string }[]>;
}

export class StubSharePointService implements ISharePointService {
  private static readonly CATCH_ALL_FOLDER = 'catch-all-uploads';

  async uploadDocument(
    _tenantId: string,
    folderId: string | null,
    fileName: string,
    _content: Buffer,
  ): Promise<{ success: boolean; fileUrl: string }> {
    const targetFolder = folderId ?? StubSharePointService.CATCH_ALL_FOLDER;
    console.log(`[STUB SharePoint] Uploading ${fileName} to folder ${targetFolder}`);
    return {
      success: true,
      fileUrl: `https://sharepoint.stub/${targetFolder}/${fileName}`,
    };
  }

  async getFolderContents(
    _tenantId: string,
    _folderId: string,
  ): Promise<{ name: string; url: string }[]> {
    return [
      { name: 'example-report.pdf', url: 'https://sharepoint.stub/example-report.pdf' },
    ];
  }
}
