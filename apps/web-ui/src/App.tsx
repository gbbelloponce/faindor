import { ThemeToggler } from "./shared/components/ThemeToggler";

const App = () => {
	return (
		<>
			<div className="bg-white text-black dark:bg-black dark:text-white">
				Hello!!
			</div>
			<ThemeToggler />
		</>
	);
};

export default App;
