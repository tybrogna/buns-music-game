import { render } from 'preact'
import { LocationProvider, Router, lazy } from 'preact-iso'

const Landing = lazy(() => import('./landing.jsx'))
const Game = lazy(() => import('./game.jsx'))
const DataViewer = lazy(() => import('./dataViewer.jsx'))

let App = () => (
    <LocationProvider>
        <Router>
            <Landing path='/' />
            <Game path='/game' />
            <DataViewer path='/files' />
        </Router>
    </LocationProvider>
)

render(App(), document.querySelector('body'))
