"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documentController_1 = require("../controllers/documentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.post('/upload', documentController_1.DocumentController.uploadMiddleware, documentController_1.DocumentController.uploadDocument);
router.get('/search', documentController_1.DocumentController.searchDocuments);
router.get('/stats', documentController_1.DocumentController.getDocumentStats);
router.get('/:id', documentController_1.DocumentController.getDocument);
router.delete('/:id', documentController_1.DocumentController.deleteDocument);
router.get('/', documentController_1.DocumentController.getDocuments);
router.post('/:id/ocr', documentController_1.DocumentController.processOCR);
router.get('/:id/download', documentController_1.DocumentController.downloadDocument);
router.get('/:id/preview-url', documentController_1.DocumentController.getDocumentPreviewUrl);
router.get('/categories/:category', documentController_1.DocumentController.getDocumentsByCategory);
exports.default = router;
//# sourceMappingURL=documents.js.map