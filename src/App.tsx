import { Provider } from "react-redux";
import { store } from "./store";
import { FiltersPanel } from "./components/Filters/FiltersPanel";
import { SvodkiList } from "./components/SvodkiList/SvodkiList";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <div className="app">
        <main className="app__main">
          <FiltersPanel />
          <SvodkiList />
        </main>
      </div>
    </Provider>
  );
}

export default App;
