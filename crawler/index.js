const axios = require('axios');
const fs = require('fs');

const users = {};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getUsersHistory(userId) {
    console.log("Working on " + userId);
    const fName = "../data/" + userId + ".data";
    if (fs.existsSync(fName)){
        console.log(" skip");
        return;
    }

    const res = await axios.get("https://www.pbinfo.ro/ajx-module/profil/json-jurnal.php?user="+userId+"&force_reload=0");
    const n = res.data.content.length-1;
    let lastId = -1;
    let seq = '';
    for (let i=n;i>=0;i--) {
        if (lastId != res.data.content[i].id && res.data.content[i].scor > 70) {
            lastId = res.data.content[i].id;
            if (seq) seq += ' ';
            seq += lastId;
        }
    }
    fs.writeFileSync(fName, seq);
    console.log(" done");
    await delay(2000);
}

async function getUserProfiles(pURL) {
    const userRegex = /<a href="\/profil\/([^"]+)">/g;
    const res = await axios.get(pURL, {responseType: 'document'});
    const htmlContent = res.data;

    // Find matches
    const users = {};
    let match;
    while ((match = userRegex.exec(htmlContent)) !== null) {
        if (!users[match[1]]) {
            users[match[1]] = 1;
            await getUsersHistory(match[1]);
        }
    }
}

function getLatestUsers() {
    const userRegex = /<a href="\/profil\/([^"]+)">/g;
    axios.get('https://www.pbinfo.ro/solutii', {responseType: 'document'})
    .then(async function(res) {
        const htmlContent = res.data;
        // Find matches
        const users = {};
        let match;
        while ((match = userRegex.exec(htmlContent)) !== null) {
            if (!users[match[1]]) {
                users[match[1]] = 1;
                await getUsersHistory(match[1]);
            }
        }
    })
    .catch(err => {
        console.log('Error: ', err.message);
    });
}

function getLatestProblems() {
    const pbRegex = /<a href="\/probleme\/(\d+)\/([^"]+)">([^<]+)<\/a>/g;
    axios.get('https://www.pbinfo.ro/solutii', {responseType: 'document'})
    .then(async function(res) {
        const htmlContent = res.data;
        // Find matches
        const problems = {};
        let match;
        while ((match = pbRegex.exec(htmlContent)) !== null) {
            if (!problems[match[1]]) {
                problems[match[1]] = 1;
                await getUserProfiles("https://www.pbinfo.ro/solutii/problema/" + match[1] + "/" + match[2]);
            }
        }
    })
    .catch(err => {
        console.log('Error: ', err.message);
    });
}

getUserProfiles("https://www.pbinfo.ro/top100");
getLatestUsers();
//getLatestProblems();
