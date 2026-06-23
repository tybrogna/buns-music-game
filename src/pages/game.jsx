import { render } from 'preact'
import * as Settings from '../settings.js'
import { useState, useEffect } from 'preact/hooks'
import { $, $$$, range, Song, shuffle } from '../js/helpers.js'
import '../css/game.css'

let teams = {}
let game = {}

function GameScreen() {
    let [haveGame, setHaveGame] = useState(false)
    let [selectedSong, setSelectedSong] = useState('')

    useEffect(async () => {
        console.log('fetchin json data')
        let selectedGameFolder = localStorage.getItem('gameFolder')
        let filesInFolder = await window.nodejs.call('filesInFolder', `./games/${selectedGameFolder}`)
        let jsonFile = filesInFolder.filter(item => item.endsWith('.json'))[0]  // first json file in folder
        let jsonData = await window.nodejs.call('readFile', `./games/${selectedGameFolder}/${jsonFile}`)
        Object.values(jsonData.music).forEach(category => {
            // console.log(category)
            category.forEach(song => song.played = false)
        })
        game = jsonData
        console.log(game)
        setHaveGame(true)
    }, [])

    if (!haveGame) {
        return (
            <div>loading...</div>
        )
    } else {
        return (
            <div className='shell'>
                <CategoryGrid categories={Object.keys(game.music)} selectFunc={setSelectedSong} />
                <input type='button' value='overlay' onClick={e => $('#player-overlay').style.display = 'block'} />
                <Teams />
                <div id='player-overlay' onClick={e => e.target.style.display = 'none'}>
                    {selectedSong}
                </div>
            </div>
        )
    }
}

function CategoryGrid(props) {
    let catNames = shuffle(props.categories)
    //give the categories random colors

    let CategoryTiles = catNames.map((catName) => { 
        return (
            <CategoryTile title={catName} selectFunc={props.selectFunc} />
        )
    })

    return (
        <>
        <div class='category-tiles-flexbox border-2'>
            {CategoryTiles}
        </div>
        </>
    )
}

// 

function CategoryTile(props) {
    return (
        <div class='category-tile-flex-item border-1' onClick={e => {props.selectFunc(e.target.innerHTML)}}>
            {props.title}
        </div>
    )
}

function Teams() {
    let TeamColumns = Object.entries(teams).map(([name, players]) => {
        return (
            <div class='border-1'>
                {name}
                <Players players={players} />
            </div>
        )
    })

    return (
        <div class='teams border-3'>
            {TeamColumns}
        </div>
    )
}

function Players(props) {
    return (
        <div class='border-2'>
            {props.players}
        </div>
    )
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