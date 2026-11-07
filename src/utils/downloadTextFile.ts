export function downloadTextFile(fileName: string, fileContent: string): void {
  const fileBlob = new Blob([fileContent], { type: 'application/json' });
  const fileObjectUrl = URL.createObjectURL(fileBlob);
  const downloadAnchor = document.createElement('a');

  downloadAnchor.setAttribute('href', fileObjectUrl);
  downloadAnchor.setAttribute('download', fileName);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  URL.revokeObjectURL(fileObjectUrl);
}
