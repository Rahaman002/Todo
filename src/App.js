import logo from './logo.svg';
import './App.css';
import Reducer from './Reducer'
import {Toaster} from 'react-hot-toast'
function App() {
  return (
    <div>
      <div><Toaster/></div>
      <Reducer />
    </div>
  );
}

export default App;
