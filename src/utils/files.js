// Legacy files have no purpose. Recognize common certificate names until an
// uploader explicitly categorizes them; an explicit attachment always wins.
export const canPreview = (file) => file.kind === 'image' || file.kind === 'pdf';

export function isCertificate(file) {
  if (!canPreview(file)) return false;
  if (file.purpose) return file.purpose === 'certificate';
  return /certificate|certification|credential|diploma/i.test(`${file.name || ''} ${file.caption || ''}`);
}
