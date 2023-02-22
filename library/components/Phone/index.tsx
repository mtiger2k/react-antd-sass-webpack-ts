import React from "react";

const Phone: React.FC = () => {
  const hello = (str: String) => {
    return str
  }
  return (
    <div className="App-route-component">
      I am {hello('Phone')}
    </div>
  )
}

export default Phone