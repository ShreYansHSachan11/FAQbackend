import FAQ from "../models/faq.model.js";
import Translation from "../utils/translate.js";
import cache from "../middleware/cache.middleware.js";

const FAQController = {
  
  async createFAQ(req, res) {
    try {
      const { question, answer, language = "en", translations = {} } = req.body;

      if (!question || !answer) {
        return res.status(400).json({ error: "Question and answer are required." });
      }

      const faq = new FAQ({ question, answer, language, translations });
      await faq.save();
      await cache.delPattern("faqs_*");

      res.status(201).json(faq);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  
  async getFAQs(req, res) {
    try {
      const lang = req.query.lang || "en";
      const cacheKey = `faqs_${lang}`;
      const cachedData = await cache.get(cacheKey);
      if (cachedData) return res.status(200).json(cachedData);

      const faqs = await FAQ.find({});
      const translatedFAQs = await Promise.all(
        faqs.map(async (faq) => {
          return lang === faq.language ? faq : await Translation.translateFAQ(faq, lang);
        })
      );

      await cache.set(cacheKey, 3600, translatedFAQs);

      res.status(200).json(translatedFAQs);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      res.status(500).json({ error: "Failed to fetch FAQs" });
    }
  },

  
  async deleteFAQ(req, res) {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ error: "Invalid FAQ ID" });
    }

    try {
      const deletedFAQ = await FAQ.findByIdAndDelete(id);
      if (!deletedFAQ) {
        return res.status(404).json({ error: "FAQ not found" });
      }

      await cache.delPattern("faqs_*");

      res.status(200).json({ message: "FAQ deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

export default FAQController;
