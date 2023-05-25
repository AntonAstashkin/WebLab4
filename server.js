const http = require('http');
const fs = require('fs');
const https = require('https');
const readline = require('readline');


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter a port number: ', (port) => {
  http.createServer((req, res) => {
    if (req.url === "/") {
      fs.readFile('index.html', (err, html) => {
        if (err) {
          res.statusCode = 500;
          res.end('Internal Server Error');
          return;
        }
        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 200;
        res.end(html);
      });
    } else if (req.url === '/style.css') {
      fs.readFile('style.css', (err, css) => {
        if (err) {
          res.statusCode = 500;
          res.end('Internal Server Error');
          return;
        }
        res.setHeader('Content-Type', 'text/css');
        res.statusCode = 200;
        res.end(css);
      });
    } else if (req.url === '/script.js') {
      fs.readFile('script.js', (err, js) => {
        if (err) {
          res.statusCode = 500;
          res.end('Internal Server Error');
          return;
        }
        res.setHeader('Content-Type', 'text/javascript');
        res.statusCode = 200;
        res.end(js);
      });
    } else if (req.url.startsWith('/api')) {
      const year = new URL(req.url, `http://${req.headers.host}`).searchParams.get('year');
      const month = new URL(req.url, `http://${req.headers.host}`).searchParams.get('month');
      const apiUrl = `https://bank.gov.ua/NBUStatService/v1/statdirectory/res?date=${year}${month}`;

      https.get(apiUrl, (apiResponse) => {
        const statusCode = apiResponse.statusCode;
        if (statusCode !== 200) {
          res.statusCode = statusCode;
          res.end('API Error');
          return;
        }

        let data = '';
        apiResponse.on('data', (chunk) => {
          data += chunk;
        });

        apiResponse.on('end', () => {
          res.setHeader('Content-Type', 'text/xml');
          res.statusCode = 200;
          res.end(data);
        });
      }).on('error', (error) => {
        console.error(error);
        res.statusCode = 500;
        res.end('Internal Server Error');
      });
    } else {
      res.statusCode = 404;
      res.end('Not Found');
    }
  }).listen(port);

  console.log(`Server running http://localhost:${port}/`);
  rl.close();
});
