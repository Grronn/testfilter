import { Provider } from "react-redux";
import { store } from "./store";
import { SvodkiList } from "./components/SvodkiList/SvodkiList";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <div className="app">
        <main className="app__main">
          {/* SvodkiList сам рендерит FiltersPanel внутри — с нужными пропсами */}
          <SvodkiList />
        </main>
      </div>
    </Provider>
  );
}

export default App;
