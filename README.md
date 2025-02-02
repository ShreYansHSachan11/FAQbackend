# FAQ Management System with Multilingual Support
This project is a Node.js-based FAQ management system that enables multilingual support, automatic translations, and efficient caching using Redis. It provides a RESTful API for easy interaction and supports Docker for containerized deployment.

## Key Features
- Supports multiple languages for FAQs
- Automated translations using Google Cloud Translation API
- Efficient caching with Redis for optimized performance
- RESTful API for seamless integration
- Docker compatibility for easy deployment

## Requirements
Before setting up the project, ensure you have the following installed:
- Node.js (v16 or later)
- MongoDB
- Redis


## Installation

1. Clone the repository

2. Install dependencies:
   ```bash
     npm install
    ```
3. Set environment variables:

4. Run the application:
   ```bash
   npm run dev
   ```


## Docker Deployment
   To deploy using Docker, execute the following command:
   ```bash
    docker-compose up --build
 ```

## API Endpoints
- `POST /api/faqs`: Create FAQ
- `GET /api/faqs?lang=en`: Retrieve FAQs (language optional)

## Testing
   ```bash
   npm test
   ```
## License

[MIT](https://choosealicense.com/licenses/mit/)

