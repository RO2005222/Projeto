const express = require('express');
const multer = require('multer');
const app = express();
const port = 3001;
const cors = require('cors');
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload= multer({storage:storage});

const mysql= require('mysql2/promise');

const pool= mysql.createPool({
    host: 'localhost',
    user: 'root',
    password:'',
    database: 'carros'
    });

app.get('/api/receive', async (req, res) => {
    console.log("tou ca");
    const [rows]= await pool.query('SELECT *FROM carro');
    res.json(rows);
    
});

app.post('/api/submit', upload.none(), async (req, res) => {
  
    const { marca, cor } = req.body; 
    let result=await saveData(marca,cor);
    if(result===-1){
      return res.status(500).json({message:'Internal server error'});
    }
    console.log(result);
    return res.json({ message: result });
    
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});


const  saveData = async (marca, cor) => {

        try{       
          const query = 'INSERT INTO carro (marca, cor) VALUES (?, ?)';
          const [result]= await pool.execute(query, [marca,cor]);
          return result.insertId;
        }
        catch (error){
          console.error("error:",error);
          return -1;
        }
};

app.post('/api/delete',  async (req, res) => {
    const { id } = req.body; 
    console.log(id);
    await deleteData(id);
    
    res.json({ message: 'Submetido com sucesso' });
});

const deleteData = async (id) => {

    
  const query = 'delete from carro where id=?';

  
  pool.execute(query, [id], (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
    } else {
      console.log('Data inserted successfully:', results);
    }
  });

};


app.post('/api/edit',  async (req, res) => {
    const { id,cor,marca } = req.body;     
    await UpdateData(id,cor,marca);   
    res.json({ message: 'Submetido com sucesso' });
});

const UpdateData = async (id,cor,marca) => {
  
  const query = 'Update carro set marca=?, cor=? where id=?';

  pool.execute(query, [marca,cor,id], (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
    } else {
      console.log('Data inserted successfully:', results);
    }
  });

};

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});