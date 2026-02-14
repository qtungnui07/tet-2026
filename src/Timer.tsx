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
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setCount((count) => count + 1);
    }, 1000);
  }, []);
  // return <h1> {days} {hours} {minutes} {seconds}
  return <h1>I've rendered {count} times!</h1>;
}

export default Timer;