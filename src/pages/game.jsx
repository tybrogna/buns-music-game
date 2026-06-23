import { render } from 'preact'
import * as Settings from '../settings.js'
import { useState, useEffect } from 'preact/hooks'
import { $, $$$, range, Song, shuffle } from '../js/helpers.js'
import '../css/game.css'

let teams = {}
let game = {}

function GameScreen() {
    let [haveGame, setHaveGame] = useState(false)

    useEffect(async () => {
        console.log('fetchin json data')
        let selectedGameFolder = localStorage.getItem('gameFolder')
        let filesInFolder = await window.nodejs.call('filesInFolder', `./games/${selectedGameFolder}`)
        let jsonFile = filesInFolder.filter(item => item.endsWith('.json'))[0]  // first json file in folder
        let jsonData = await window.nodejs.call('readFile', `./games/${selectedGameFolder}/${jsonFile}`)
        game = jsonData
        setHaveGame(true)
    }, [])

    if (!haveGame) {
        return (
            <div>loading...</div>
        )
    } else {
        return (
            <div>
                <CategoryGrid categories={Object.keys(game.music)} />
                <Teams />
            </div>
        )
    }
}

function CategoryGrid(props) {
    let catNames = shuffle(props.categories)
    //give the categories random colors

    let CategoryTiles = catNames.map((catName) => { 
        return (
            <CategoryTile title={catName} />
        )
    })

    return (
        <>
        {CategoryTiles}
        </>
    )
}

function CategoryTile(props) {
    return (
        <div class='temp-tile'>
            {props.title}
        </div>
    )
}

function Teams() {
    
}

function defaultTeams() {
    let teams = "east side,west side"
    let players = 'east side|||notorious B.I.G.,east side|||puff daddy,west side|||2Pac,west side|||dr dre'
    return [teams,players]
}

export default function() {
    let incomingTeams = localStorage.getItem('teams')
    let incomingPlayers = localStorage.getItem('players')
    if (incomingTeams == '' || incomingPlayers == '') {
        [incomingTeams, incomingPlayers] = defaultTeams()
    }

    incomingTeams.split(',').forEach(t => teams[t] = [])
    incomingPlayers.split(',').forEach(player => {
        let [t, name] = player.split('|||')
        teams[t].push(name)
    })

    // console.log(teams)
    // console.log(players)
    // console.log(gameFolder)
    // let jsonData = getDataFile()
    // console.log('rendering page')
    render(GameScreen(), document.body)
}