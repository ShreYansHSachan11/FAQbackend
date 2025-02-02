import translate from "google-translate-api-x";

const Translate = {
  async translateFAQ(faq, targetLanguage) {
    try {
      if (faq.translations?.[targetLanguage]) {
        const translated = faq.translations[targetLanguage];
        console.log(`Using cached translation for language: ${targetLanguage}`);
        return {
          ...faq,
          question: translated.question,
          answer: translated.answer,
        };
      }

      const [translatedQuestion, translatedAnswer] = await Promise.all([
        translate(faq.question, { to: targetLanguage }).then((res) => res.text),
        translate(faq.answer, { to: targetLanguage }).then((res) => res.text),
      ]);

      console.log(`Translated FAQ to ${targetLanguage}:`, {
        question: translatedQuestion,
        answer: translatedAnswer,
      });

      return {
        ...faq,
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
