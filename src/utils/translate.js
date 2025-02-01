import translate from "@vitalets/google-translate-api";

const Translate = {
  async translateFAQ(faq, targetLanguage) {
    try {
     
      if (faq.translations?.has(targetLanguage)) {
        const translated = faq.translations.get(targetLanguage);
        return {
          ...faq.toObject(),
          question: translated.question,
          answer: translated.answer,
        };
      }

      
      const [translatedQuestion, translatedAnswer] = await Promise.all([
        translate(faq.question, { to: targetLanguage }).then((res) => res.text),
        translate(faq.answer, { to: targetLanguage }).then((res) => res.text),
      ]);

     
      return {
        ...faq.toObject(),
        question: translatedQuestion,
        answer: translatedAnswer,
      };
    } catch (error) {
      console.error("Translation Error:", error);
      return faq; 
    }
  },
};

export default Translate;
