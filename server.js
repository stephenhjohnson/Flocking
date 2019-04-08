const express     = require('express');

const PORT        = process.env.PORT || 3000;
const app         = express();

app.use(express.static(__dirname));

app.get('/', function(req, res) {
  response.sendFile(__dirname + '/index.html');
});

app.listen(PORT, err => {
  if(err) {
    console.log(err);
  } else {
    console.log(`Server listening on port: ${PORT}`);
    console.log(`To Test:`);
    console.log(`http://localhost:3000`);
  }
});
