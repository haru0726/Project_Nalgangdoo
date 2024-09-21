export default (err, req, res, next) => {
  console.error(err);

  res.status(500).json({ message: "서버 에러가 발생했습니다!" });
};
