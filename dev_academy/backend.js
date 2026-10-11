import { createRoot } from 'react-dom/client';
import { createPortal } from '@wordpress/element';
import AdminMenu from '@Containers/backend-dashboard/AdminMenu';
import BackendDashboard from './containers/backend-dashboard';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import store from './redux/store';
import ErrorBoundary from './components/ErrorBoundary';
import './../assets/scss/backend.scss';
import './tailwind.css';

export const { nonce, academy_nonce, ajaxurl } = window.AcademyGlobal;

document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('academywrap');
	if (container) {
		const root = createRoot(container);
		const menuPage = document.getElementById('toplevel_page_academy');
		function MenuPortal({ children }) {
			menuPage.innerHTML = '';
			return createPortal(children, menuPage);
		}
		root.render(
			<Provider store={store}>
				<Router>
					<MenuPortal>
						<AdminMenu />
					</MenuPortal>
					<ErrorBoundary>
						<BackendDashboard />
					</ErrorBoundary>
				</Router>
			</Provider>
		);
	}
});
