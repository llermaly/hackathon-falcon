import axios from "axios";

const udemyClientId = process.env.UDEMY_CLIENT_ID;
const udemyClientSecret = process.env.UDEMY_CLIENT_SECRET;
const credentials = `${udemyClientId}:${udemyClientSecret}`;
const buff = Buffer.from(credentials);
const udemyAuth = buff.toString("base64");

export const fetchUdemyCourses = async ({
  search,
  size,
}: {
  search: string;
  size: number;
}) => {
  const { data } = await axios.get("https://www.udemy.com/api-2.0/courses/", {
    headers: {
      Authorization: `Basic ${udemyAuth}`,
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    params: {
      search: search,
      page_size: size,
    },
  });

  return data;
};
