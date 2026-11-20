import { model } from "./model";

const response = await model.invoke("只回复：连接成功");
console.log(response.content);
