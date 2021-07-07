let http = require("http");
let fs = require("fs");
let url = require("url");
let qs = require("querystring");
let userPath = __dirname + "/contacts/";


let server = http.createServer(handleServer);

function handleServer(req, res) {
    let store = '';
    let parsedUrl = url.parse(req.url, true);
    req.on("data", (chunk) => {
        store += chunk;
    })

    req.on('end', () => {
        if(req.method === "GET" && req.url === "/") {
            res.setHeader("Content-Type", "text/html");
            fs.createReadStream("./index.html").pipe(res);
        }
        else if (req.url.split('.').pop() === 'css') {
            res.setHeader("Content-Type", "text/css");
            fs.createReadStream(__dirname + req.url).pipe(res);
        }
        else if (['jpeg', 'png', 'jfif', 'jpg'].includes(req.url.split('.').pop())) {
            res.setHeader("Content-Type", "image/*");
            fs.createReadStream(__dirname + req.url).pipe(res);
        }
        else if (req.url === '/about' && req.method === "GET") {
            res.setHeader("Content-Type", "text/html");
            fs.createReadStream('./about.html').pipe(res);
        }
        else if (req.url === '/contact' && req.method === 'GET') {
            res.setHeader("Content-Type", "text/html");
            fs.createReadStream('./form.html').pipe(res);
        }
        else if (req.url === "/form" && req.method === 'POST') {
            let parsedData = qs.parse(store);
            let username = parsedData.username;
            let stringifyData = JSON.stringify(parsedData);
            fs.open(userPath + username + '.json', 'wx', (err, fd) => {
                if(err) console.log(err);
                fs.writeFile(fd, stringifyData, (err) => {
                    if(err) console.log('Username taken');
                    fs.close(fd, (err) => {
                        if(err) console.log(err);
                        res.end(`${username} successfully created`);
                    })
                })
            }) 
        }
        else if (parsedUrl.pathname === '/users' && req.method === 'GET') {
            let username = parsedUrl.query.username;
            fs.readFile(userPath + username + '.json', (err, content) => {
                res.setHeader("Content-Type", "text/html");
                let data = JSON.parse(content);
                if(err) console.error(err);
                res.write(`
                    <h1 style="color:crimson;">Name : ${data.name}</h1>
                    <h1 style="color:blue;">Email : ${data.email}</h1>
                    <h1 style="color:purple;">username : ${data.username}</h1>
                    <h1 style="color:green;">age : ${data.age}</h1>
                    <h1 style="color:teal;">Bio : ${data.bio}</h1>
                `)
                res.end();
            })
        }
    })
}


server.listen(5000, () => {
    console.log("Server is listening at port 5000");
})