import { render } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { $, $$$, range } from '../js/helpers.js'
import * as Settings from '../settings.js'
import '../css/landing.css'

function LogoBox(props) {
    return (
        <div id='logo-box'>
            <img class='logo' src='./src/assets/logo.webp' />
        </div>
    )
}

function TeamSetup(props) {
    let [teams, setTeams] = useState(0)

    useEffect(() => {
        let teamsAlreadySetUp = () => {
            let numberOfTeams = 0
            let storedTeams = localStorage.getItem('teams')
            let storedPlayers = localStorage.getItem('players')

            if (storedTeams != null) {
                let teams = storedTeams.split(',')
                numberOfTeams = Math.max(numberOfTeams, teams.length)

            }
            if (storedPlayers != null) {

            }
        }

        if (teams == 0) {
            teamsAlreadySetUp()
        }
    })

    let Teams = range(teams).map(item => {
        return (
            <>
            <input type='text' class='team-name-textbox' placeholder='Team Name...' />
            <textarea rows='6' class='players-textbox' cols='40' placeholder='Participants, one per line...' />
            </>
        )
    })

    return (
        <div id='team-setup-box'>
            <input type='button' value='Add Team' onclick={e => {setTeams(teams + 1)}} />
            <div>
                {Teams}
            </div>
        </div>
    )
}

function GameSelect() {
    let [ gamesFound, setGamesFound ] = useState([])

    let checkFolderForGames = async () => {
        let filesInFolder = await window.nodejs.call('filesInFolder', './games')
        setGamesFound(filesInFolder)
    }

    useEffect(async () => {
        await checkFolderForGames()
    }, [])

    return (
        <>
        <input type="button" value="check for new games" onClick={checkFolderForGames} />
        <select id='game-folder-select'>
            {gamesFound.map((item) => {
                return (
                    <option value={item}>{item}</option>
                )
            })}
        </select>
        </>
    )
}

function Landing() {

    return (
        <div id='shell'>
            <LogoBox />
            <TeamSetup />
            <GameSelect />
            <a href='/files'>file viewer</a>
            <a href='/music-test'>music test</a>
            <input type='button' value='Start Game' onclick={e => startGame()}/>
        </div>
    )
}

function startGame(event) {
    let nodes = $$$('.team-name-textbox')
    let teams = Array.from(nodes).map(node => { node.value.replace(',', '.') })
    console.log(teams)

    nodes = $$$('.players-textbox')
    let players = Array.from(nodes).map((node, idx) => {
        let splits = node.value.split('\n')
        splits = splits.map(s => {
            let s2 = s.replace(',', '.')
            return teams[idx] + "|||" + s2
        })
        return splits
    })
    console.log(players)

    let gameFolder = $('#game-folder-select').value

    if (gameFolder == '') {
        console.log("you have to select a game to play")
        return
    }

    if (teams.length != players.length) {
        console.log("a team is missing a name or players")
        return
    }

    localStorage.setItem('teams', teams)
    localStorage.setItem('players', players)
    localStorage.setItem('gameFolder', gameFolder)
    window.open('/game', '_self')
}

export default function() {
    render(Landing(), document.body)
}