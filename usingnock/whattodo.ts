import express from "express";
const app = express();
import fetch from "node-fetch";

app.get("/whattodo", async (req, res) => {
  const whatToDo = await fetch(
    "https://www.boredapi.com/api/activity"
  ).then((r) => r.json());
  res.json(whatToDo);
});

app.get("/nameinfo/:name", async (req, res) => {
  const { name: paramName } = req.params;
  const result = await Promise.all([
    fetch(`https://api.genderize.io?name=${paramName}`).then((res) =>
      res.json()
    ),
    fetch(`https://api.nationalize.io?name=${paramName}`).then((res) =>
      res.json()
    ),
    fetch(`https://api.agify.io?name=${paramName}`).then((res) => res.json()),
  ]);
  console.log(result );
  const [{ gender },{country: [{ country_id }]},{ age }] = result;
  console.log(gender, country_id, age)
  res.json({ gender, country_id, age });
});

export default app;
