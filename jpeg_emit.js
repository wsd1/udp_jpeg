/*
UDP传JPEG演示

协议：
报文头部1个字节，为序列号，最高位表示最后一个报文。所以序列号只能从0~127。
按照最大报文1459，最大能传递 185293字节的文件。

这是一个客户端程序，用于发送文件。

npm i bufferpack

*/



const dgram = require('dgram');
const fs = require('fs');
const client = dgram.createSocket('udp4');
const Bufpack = require("bufferpack");

const UDP_MAX = 1460-1

var jpg_buf = fs.readFileSync('video1.jpg');

console.log(`Read jpg file, length:${jpg_buf.length}`);

let i = 0;

send(0);

function send(start){
  let len = jpg_buf.length - start < UDP_MAX ? jpg_buf.length - start : UDP_MAX;
  let is_last = ((start + len) == jpg_buf.length);
  let seq = is_last? 128+i : i;
  i++;
  let send_buf = Bufpack.pack(`B${len}A`, [seq, jpg_buf.slice(start, start+len)]);

  console.log(send_buf.length);
  client.send(send_buf, 8064, '192.168.1.28', (err)=>{
    if(!err && !is_last)
      setTimeout(()=>{send(start + len);}, 1);
    else if(is_last){
      client.close();
    }
    else{
      console.log(err);
    }
  });
}
