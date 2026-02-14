import { useState, useEffect } from 'react';

function getTime(): number[] {
  let new_date = new Date();
  let target_date = new Date(2026,2,17,0,0,0,0);
  let day = target_date.getDate() - new_date.getDate();
  let hour = target_date.getHours() - new_date.getHours();
  let minute = target_date.getMinutes() - new_date.getMinutes();
  let second = target_date.getSeconds() - new_date.getSeconds();
  if (second<0) {
      second += 60;
      minute -= 1;
    };
  if (minute<0) {
    minute += 60;
    hour -= 1;
  };
  if (hour<0) {
    hour += 24;
    day -= 1;
  };
  if (day<0) {
    return [0,0,0,0]
  }
  return [day,hour,minute,second]
}

function Timer() {
  const [timeLeft, setTimeLeft] = useState<number[]>(getTime());

  useEffect(() => {
    setInterval(() => {
      setTimeLeft(timeLeft => getTime());
    }, 1000);
  }, []);
  // return <h1> {days} {hours} {minutes} {seconds}
  return <table className="timer">
  <thead>
    <tr>
      <th>DAYS</th>
      <th>HOURS</th>
      <th>MINUTES</th>
      <th>SECONDS</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><center>{timeLeft[0]}</center></td>
      <td><center>{timeLeft[1]}</center></td>
      <td><center>{timeLeft[2]}</center></td>
      <td><center>{timeLeft[3]}</center></td>
    </tr>
  </tbody>
</table>;
}

export default Timer;