/*Reference - "https://expressjs.com/en/starter/hello-world.html"*/
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 8050;

/*Reference - "https://www.youtube.com/watch?v=Nmv2-oSQyWE"*/
// Creating MongoDB connection
mongoose.connect('mongodb://0.0.0.0/client_details_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));


// creating the client schema and model
const clientSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  image: String,
});
const Client = mongoose.model('Client', clientSchema);


/* Reference - https://www.makeuseof.com/upload-image-in-nodejs-using-multer/ */
// Setting up multer storage location
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

//Configure image validation
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

/* Reference - https://stackoverflow.com/questions/56134244/why-is-my-express-code-not-rendering-css-and-javascript-files */
//rendering static files (images and css file)
app.use('/uploads', express.static('uploads'));
app.use(express.static('views'));

// use body-parser to extract content of the form
//Reference - https://www.tutorialspoint.com/expressjs/expressjs_form_data.htm
app.use(bodyParser.urlencoded({ extended: true }));

/* Reference - https://stackabuse.com/get-http-post-body-in-express-js/ */
// Extracting form submission data with image upload
app.post('/submit', upload.single('image'), async (req, res) => {
  const { name, amount } = req.body;

  // Handle image upload and get the name of the image
  const imageName = req.file ? req.file.originalname : '';

  /* Reference - https://www.youtube.com/watch?v=ZKwrOXl5TDI */
  try {
    // Create a new client in the database
    const newClient = new Client({ name, amount, image: imageName });
    await newClient.save();
    res.redirect('/');
  } catch (err) {
    console.error('Error saving client:', err);
    res.status(500).send('Error saving client.');
  }
});

// Set up EJS as the template engine
app.set('view engine', 'ejs');

// Route to display existing clients
app.get('/', async (req, res) => {
    try {
      const clients = await Client.find({});
      res.render('index', { clients });
    } catch (err) {
      console.error('Error retrieving clients:', err);
      res.status(500).send('Error retrieving clients.');
    }
  });

// Initializing the the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
