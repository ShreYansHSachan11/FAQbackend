import express from 'express';
import FAQController from '../controllers/faq.controller.js';

const router = express.Router();

router.get('/', FAQController.getFAQs);
router.post('/', FAQController.createFAQ);
router.delete('/:id', FAQController.deleteFAQ); 

export default router;
