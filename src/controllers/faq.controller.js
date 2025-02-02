import FAQ from "../models/faq.model.js";
import Translation from "../utils/translate.js";
import { cache, redisClient } from "../middleware/cache.middleware.js";

const FAQController = {
  // Create a new FAQ
  async createFAQ(req, res) {
    try {
      const { question, answer, language = "en", translations = {} } = req.body;
  
      if (!question || !answer) {
        return res.status(400).json({ error: "Question and answer are required." });
      }
  
      // Create new FAQ
      const faq = new FAQ({ question, answer, language, translations });
      await faq.save();
  
      // Fetch updated FAQs from MongoDB after adding the new FAQ
      const faqs = await FAQ.find({}).lean();
  
      // Filter the FAQs for the language of the newly added FAQ (or fetch all FAQs)
      const filteredFAQs = faqs.filter(faq => faq.language === language);
  
      // Cache the updated FAQ list for the specific language
      const cacheKey = `faqs_${language}`;
      await cache.set(cacheKey, 3600, filteredFAQs);
  
      console.log("FAQ added and cache updated for language:", language);
  
      res.status(201).json(faq);
    } catch (error) {
      console.error("Error creating FAQ:", error);
      res.status(400).json({ error: error.message });
    }
  }
  ,

  // Get all FAQs
  async getFAQs(req, res) {
    try {
      const lang = req.query.lang || "en";
      const cacheKey = `faqs_${lang}`;
      
      // Check for cached data
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        console.log("Serving from cache");
        return res.status(200).json(cachedData);
      }

      // Fetch data from MongoDB
      const faqs = await FAQ.find({}).lean(); // Convert MongoDB documents to plain objects

      if (!faqs.length) {
        console.log("No FAQs found in MongoDB");
        await cache.delPattern("faqs_*");
        return res.status(200).json([]);
      }

      const translatedFAQs = await Promise.all(
        faqs.map(async (faq) => {
          return lang === faq.language ? faq : await Translation.translateFAQ(faq, lang);
        })
      );

      
      await cache.set(cacheKey, 3600, translatedFAQs);
      console.log("Caching FAQs");

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
  
      console.log(`FAQ deleted from MongoDB: ${id}`);
  
      
      const cacheKeys = await redisClient.keys("faqs_*");
  
      for (const key of cacheKeys) {
        const cachedFAQs = await cache.get(key);
        if (cachedFAQs && Array.isArray(cachedFAQs)) {
          const updatedFAQs = cachedFAQs.filter(faq => faq._id !== id);
  
          if (updatedFAQs.length === 0) {
            console.log(`Cache key ${key} is now empty, deleting from Redis`);
            await redisClient.del(key); 
          } else {
            await cache.set(key, 3600, updatedFAQs); 
          }
        }
      }
  
      console.log(`FAQ removed from Redis cache: ${id}`);
  
      res.status(200).json({ message: "FAQ deleted successfully" });
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      res.status(500).json({ error: "Failed to delete FAQ" });
    }
  },
};

export default FAQController;
