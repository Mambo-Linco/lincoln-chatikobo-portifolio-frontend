import test from 'node:test';
import assert from 'node:assert/strict';
import { canPreview, isCertificate } from '../src/utils/files.js';

for (const kind of ['pdf', 'image']) {
  test(`${kind} certificates are publicly previewable`, () => {
    const file = { kind, purpose: 'certificate', name: 'qualification' };
    assert.equal(canPreview(file), true);
    assert.equal(isCertificate(file), true);
  });
}

test('non-viewable document cannot be classified as a certificate', () => {
  assert.equal(canPreview({ kind: 'document' }), false);
  assert.equal(isCertificate({ kind: 'document', purpose: 'certificate', name: 'Certificate.docx' }), false);
});

test('legacy PDF certificate filename is recognized', () => {
  assert.equal(isCertificate({ kind: 'pdf', purpose: null, name: 'Course_Certificate.PDF' }), true);
});

test('legacy image certificate caption is recognized', () => {
  assert.equal(isCertificate({ kind: 'image', name: 'scan.jpg', caption: 'Graduation diploma' }), true);
});

test('explicit ordinary attachment overrides filename recognition', () => {
  assert.equal(isCertificate({ kind: 'pdf', purpose: 'attachment', name: 'certificate-notes.pdf' }), false);
});

test('ordinary project pictures and PDFs stay in their existing sections', () => {
  assert.equal(isCertificate({ kind: 'image', name: 'project-screenshot.png' }), false);
  assert.equal(isCertificate({ kind: 'pdf', name: 'project-report.pdf' }), false);
});
