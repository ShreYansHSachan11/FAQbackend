import { use, expect } from 'chai';
import chaiHttp from 'chai-http';
const chai = use(chaiHttp);
import app from '../app.js'; 
import FAQ from '../models/faq.model.js'; 
import mongoose from 'mongoose';


const requester = chai.request(app).execute; 

describe('FAQ API', () => {
  let faqId;

  
  it('should create a new FAQ', done => {
    const newFAQ = {
      question: 'What is Node.js?',
      answer: 'Node.js is a JavaScript runtime built on Chrome\'s V8 JavaScript engine.',
      language: 'en',
    };

    requester
      .post('/api/faqs')
      .send(newFAQ)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('_id');
        expect(res.body.question).to.equal(newFAQ.question);
        expect(res.body.answer).to.equal(newFAQ.answer);

        faqId = res.body._id; 
        done();
      });
  });

  
  it('should get all FAQs', done => {
    requester
      .get('/api/faqs?lang=en')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length.greaterThan(0);
        done();
      });
  });

  
  it('should get FAQs in specific language', done => {
    requester
      .get('/api/faqs?lang=hi')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });

  
  it('should delete a FAQ by ID', done => {
    requester
      .delete(`/api/faqs/${faqId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('FAQ deleted successfully');
        done();
      });
  });

 
  after(async () => {
    await FAQ.deleteMany({});
    mongoose.connection.close();
  });
});
