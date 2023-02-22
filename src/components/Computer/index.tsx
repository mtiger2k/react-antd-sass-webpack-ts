import React from "react";
import { Button } from 'antd';
import styles from './styles.module.scss';

const Computer: React.FC = () => {
  return (
    <div className="App-route-component">
      <p id="data-controlid" className={styles.computer}>I am Computer</p>
      <Button type="primary">Click Me</Button>
    </div>
  )
}

export default Computer