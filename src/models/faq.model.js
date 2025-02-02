import mongoose from 'mongoose';

const FAQSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },

  answer: {
    type: String,
    required: true
  },

  translations: {
    type: Map,
    of: new mongoose.Schema({
      question: String,
      answer: String
    }, { _id: false })
  },

  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi', 'bn', 'es', 'fr', 'ja', 'ko', 'de', 'it', 'pa'], 
  },
},{ timestamps: true });

FAQSchema.methods.getTranslatedQuestion = function (lang) {
  return this.translations.get(lang)?.question || this.question;  
};

FAQSchema.methods.getTranslatedAnswer = function (lang) {
  return this.translations.get(lang)?.answer || this.answer;  
};

const FAQ = mongoose.model('FAQ', FAQSchema);
export default FAQ;
