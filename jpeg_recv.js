/*
UDP传JPEG演示

协议：
报文头部1个字节，为序列号，最高位表示最后一个报文。所以序列号只能从0~127。
按照最大报文1459，最大能传递 185293字节的文件。

这是一个服务程序，用于接收文件。

npm i bufferpack

*/

const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const Bufpack = require("bufferpack");
const fs = require('fs');

let buf_recv = Buffer.alloc(0);
let seq = 0;

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  var ret = Bufpack.unpack(`B(seq)${msg.length-1}A(chunk)`, msg)
  console.log(`server got: [${ret.seq}]${msg.length}bytes from ${rinfo.address}:${rinfo.port}`);

  let s = ret.seq >= 128 ? ret.seq - 128 : ret.seq;
  if(s != seq++){
    console.log(`Seq out of order, reset`);
    buf_recv = Buffer.alloc(0);
    seq = 0;
    return;
  }
  buf_recv = Buffer.concat([buf_recv, ret.chunk]);
  if(ret.seq >= 128){
    fs.writeFileSync(`video.jpg`, buf_recv);
    console.log(`Get picture, len:${buf_recv.length}`);
    buf_recv = Buffer.alloc(0);
    seq = 0;
  }

});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(8064);
// server listening 0.0.0.0:41234
