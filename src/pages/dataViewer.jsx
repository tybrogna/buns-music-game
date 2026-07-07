import { render } from 'preact'
import path from 'path'
import { useState, useEffect } from 'preact/hooks'
import { $, $$$, range, Song, Category } from '../js/helpers.js'
import * as Settings from '../settings.js'
import '../css/dataViewer.css'

let defaultLocation = "./games/test-game"
let defaultJson = "./data/data.json"
let gameData = {}
let selectedGame = ''

function testWrite(event) {
    let data = {}
    data.songsLocation = "songs"
    data.albumArtsLocation = "album_art"
    data.backgroundsLocation = "backgrounds"
    data.music = {
        "jrpg":[],
        "rts":[],
        "nintendo":[]
    }
    data.music.jrpg.push({
        "title": "Schala's Theme",
        "composer": "Yasunori Mitsuda",
        "game": "Chrono Trigger",
        "year": 1995,
        "soundFile": "schala.mp3",
        "startTime": "0",
        "backgroundImg": "ct.jpg",
        "albumArtImg": "ct.jpg"
    })
    data.music.jrpg.push({
        "title": "A New Hope",
        "composer": "Masayoshi Soken",
        "game": "Final Fantasy XIV",
        "year": 2013,
        "soundFile": "uldah.mp3",
        "startTime": "0",
        "backgroundImg": "uldah.jpg",
        "albumArtImg": "xivarr.jpg"
    })
    data.music.rts.push({
        "title": "Terran One",
        "composer": "Glenn Stafford",
        "game": "Starcraft",
        "year": 1997,
        "soundFile": "terran.mp3",
        "startTime": "20",
        "backgroundImg": "starcraft.jpg",
        "albumArtImg": "starcraft.jpg"
    })
    data.music.rts.push({
        "title": "Hell March",
        "composer": "Frank Klepacki",
        "game": "Command & Conquer: Red Alert",
        "year": 1995,
        "soundFile": "hellmarch.mp3",
        "startTime": "19",
        "backgroundImg": "cncra.jpg",
        "albumArtImg": "cncra.jpg"
    })
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
    }); 
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test.json`;
    a.click();
    URL.revokeObjectURL(url);
}

async function testBridge(event) {
    let result = await window.nodejs.call('test', null)
    console.log(result)
}

function DataTableRows(props) {
    // let {soundLocation, albumArtLocation, bgLocation} = props.gameData
    let [extraCategories, setExtraCategories] = useState(0)

    let Categories = props.gameData.music.map((data, idx) => {
        return (
            <CategoryRow id={idx} data={data} gameType={props.gameData.style} />
        )
    })

    let NewCategories = range(extraCategories).map(num => {
        return (
            <CategoryRow id={100 + num} data={{name: '', tileImg: '', songs: []}} gameType={props.gameData.style} />
        )
    })

    return(
        <tbody>
            {Categories}
            {NewCategories}
            <tr id='new-category-row'>
                <td> - </td>
                <td> - </td>
                <td> - </td>
                <td> - </td>
                <td> <input type='button' style="color: green;" value='category +' onClick={e => {setExtraCategories(extraCategories + 1)}} /></td>
            </tr>

        </tbody>
    )
}

function CategoryRow(props) {
    let [categoryName, setCategoryName] = useState(props.data.name)
    let [tileImg, setTileImg] = useState(props.data.tileImg)
    let [extraRows, setExtraRows] = useState(0)
    let rowId = 'r' + props.id
    let compressed = false
    let toggleDisplay = (e) => {

        $$$(`#${rowId}`).forEach(a => {
            console.log(a)
            if (compressed) {
                a.style.display = ""
            } else {
                a.style.display="none"
            }
        })
        compressed = !compressed
    }

    let removeCategory = (e) => {
        let treeUp = e.target
        while (treeUp.id != "category-header") {
            treeUp = treeUp.parentNode
        }
        treeUp.classList.add("deleted")
        treeUp = treeUp.nextSibling
        while (treeUp && treeUp.id != "category-header" && treeUp.id != 'new-category-row') {
            console.log(treeUp)
            treeUp.classList.add("deleted")
            treeUp = treeUp.nextSibling
        }
    }

    let SongRows = props.data.songs.map(song => {
        return (
            <SongRow song={song} rowId={rowId} rowName={categoryName} gameType={props.gameType} />
        )
    })

    let NewRows = range(extraRows).map(num => {
        return (
            <SongRow song={Song()} rowId={rowId} rowName={categoryName} gameType={props.gameType}  />
        )
    })

    return (
    <>
        <tr id='category-header'>
            <td> - </td>
            <td> <input id="tr-category-name" defaultValue={categoryName} onInput={e => setCategoryName(e.currentTarget.value)} /> </td>
            <td> <input id="tr-tile-img" defaultValue={tileImg} onInput={e => setTileImg(e.currentTarget.value)} /> </td>
            <td> <input type='button' value='compress' onClick={toggleDisplay}/> </td>
            <td> <input type='button' style="color: red;" value='DELETE CATEGORY' onClick={removeCategory}/> </td>
        </tr>
        {SongRows}
        {NewRows}
        <tr >
            <td style="border-bottom: 1px solid black;"> - </td>
            <td> <input type='button' style="color: green;" value='song +' onClick={e => {setExtraRows(extraRows + 1)}} /></td>
        </tr>
    </>
    )

}

function SongRow(props) {
	const [title, setTitle] = useState(props.song.title)
	const [composer, setComposer] = useState(props.song.composer)
	const [game, setGame] = useState(props.song.game)
	const [artist, setArtist] = useState(props.song.artist)
	const [album, setAlbum] = useState(props.song.album)
	const [year, setYear] = useState(props.song.year)
	const [soundFile, setSoundFile] = useState(props.song.soundFile)
	const [startTime, setStartTime] = useState(props.song.startTime)
	const [duration, setDuration] = useState(props.song.duration)
	const [background, setBackground] = useState(props.song.backgroundImg)

    let checkFolderForGames = async () => {
        let filesInFolder = await window.nodejs.call('filesInFolder', './games')
        setGamesFound(filesInFolder)
    }


    let removeSong = (e) => {
        e.target.parentNode.parentNode.classList.add("deleted")
    }

    let gameTypeRows = () => {
        if (props.gameType == "game") {
            return (
                <>
                <td> <input id='tr-composer' type='text' defaultValue={composer} onInput={e => setComposer(e.currentTarget.value)} /> </td>
                <td> <input id='tr-game-name' type='text' defaultValue={game} onInput={e => setGame(e.currentTarget.value)} /> </td>
                </>
            )
        } else if (props.gameType == "music") {
            return (
                <>
                <td> <input id='tr-artist' type='text' defaultValue={artist} onInput={e => setComposer(e.currentTarget.value)} /> </td>
                <td> <input id='tr-album' type='text' defaultValue={album} onInput={e => setGame(e.currentTarget.value)} /> </td>
                </>
            )
        } else {
            return (
                <>
                <td> <input id='tr-composer' type='text' defaultValue={composer} onInput={e => setComposer(e.currentTarget.value)} /> </td>
                <td> <input id='tr-game-name' type='text' defaultValue={game} onInput={e => setGame(e.currentTarget.value)} /> </td>
                <td> <input id='tr-artist' type='text' defaultValue={artist} onInput={e => setComposer(e.currentTarget.value)} /> </td>
                <td> <input id='tr-album' type='text' defaultValue={album} onInput={e => setGame(e.currentTarget.value)} /> </td>
                </>
            )
        }
    }

    return (
        <tr id={props.rowId} name={props.rowName}>
            <td> <input type='button' style="color: red;" value='X' onClick={removeSong} /></td>
            <td> <input id='tr-title' type='text' defaultValue={title} onInput={e => setTitle(e.currentTarget.value)} /> </td>
            {gameTypeRows()}
            <td> <input id='tr-year' type='text' defaultValue={year} onInput={e => setYear(e.currentTarget.value)} /> </td>
            {FilesTd('tr-sound-file', 'songs', soundFile, setSoundFile)}
            <td> <input id='tr-start-time' type='text' defaultValue={startTime} onInput={e => setStartTime(e.currentTarget.value)} /> </td>
            <td> <input id='tr-duration' type='text' defaultValue={duration} placeholder={gameData.defaultDuration} onInput={e => setDuration(e.currentTarget.value)} /> </td>
            {FilesTd('tr-background', 'bgs', background, setBackground)}
            {FilesTd('tr-album', 'albums', album, setAlbum)}
        </tr>
    )
}

function FilesTd(id, folderLocation, stateVal, setStateVal) {
    const [options, setOptions] = useState([])

    useEffect(async () => {
        let filesInFolder = await window.nodejs.call('filesInFolder', `./games/${selectedGame}/${folderLocation}`)
        setOptions(filesInFolder)
    }, [])

    let Options = options.map(file => {
        return (
            <option value={file}></option>
        )
    })

    return (
        <td>
            <input list={id+'-datalist'} id={id} type='text' defaultValue={stateVal} onInput={e => setStateVal(e.currentTarget.value)} />
            <datalist id={id+'-datalist'}>
                {Options}
            </datalist>
        </td>
    )
}

function GameSelect(props) {
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
        <select id='game-folder-select' onChange={props.loadGameJson}>
            <option value=''></option>
            {gamesFound.map((item) => {
                return (
                    <option value={item}>{item}</option>
                )
            })}
        </select>
        </>
    )
}

function DataViewer() {
    let [haveJson, setHaveJson] = useState(false)
    let [gameType, setGameType] = useState('game')

    let testRead = async function(target) {
        if (haveJson) {
            gameData = null
            setHaveJson(false)
        }
        selectedGame = $('#game-folder-select').value
        let filesInFolder = await window.nodejs.call('filesInFolder', `./games/${selectedGame}`)
        let jsonFile = filesInFolder.filter(item => item.endsWith('.json'))[0]  // first json file in folder
        let jsonData = await window.nodejs.call('readFile', defaultLocation + '/' + jsonFile)
        gameData = jsonData
        setHaveJson(true)
    }

    let reload = async function(target) {
        setHaveJson(false)
        let filesInFolder = await window.nodejs.call('filesInFolder', `./games/${selectedGame}`)
        let jsonFile = filesInFolder.filter(item => item.endsWith('.json'))[0]  // first json file in folder
        let jsonData = await window.nodejs.call('readFile', defaultLocation + '/' + jsonFile)
        gameData = jsonData
        setHaveJson(true)
    }

    let metadataTags = () => {
        if (gameType == 'game') {
            return (
                <>
                <th>composer</th>
                <th>game</th>
                </>
            )
        } else if (gameType == 'music') {
            return (
                <>
                <th>artist</th>
                <th>album</th>
                </>
            )
        } else {
            return (
                <>
                <th>composer</th>
                <th>game</th>
                <th>artist</th>
                <th>album</th>
                </>
            )
        }
    }

    if (!haveJson) {
        return (
            <div>
                <GameSelect loadGameJson={testRead} />
                {/* <input id='data-location-box' type='text' value={defaultLocation} /> */}
                {/* <input type='button' value='console.log teams' onClick={e => console.log(localStorage.getItem('teams'))} /> */}
                {/* <input type='button' value='console.log players' onClick={e => console.log(localStorage.getItem('players'))} /> */}
                {/* <input type='button' value='check folder' onClick={e => testBridge()} /> */}
                {/* <input type='button' value='write test file' onClick={e => testWrite()} /> */}
                {/* <input type='button' value='scan default folder' onClick={e => testRead()} /> */}
            </div>
        )
    } else {
        return (
            <div>
                <input type='button' value='reload' onClick={reload} />
                {/* <GameSelect loadGameJson={testRead} /> */}
                {/* <input type='button' value='--- REFRESH ---' onClick={e => window.location.reload()} /> */}
                {/* <input type='button' value='write test file' onClick={e => testWrite()} />
                <input type='file' value='open data file' accept='application/json' onChange={e => testRead(e.target)} /> */}
                <fieldset>
                    <legend>Game Rules</legend>
                    <div>
                        <label for='countdown'>Countdown between selecting a category and song starts playing:</label>
                        <input id='countdown-input' name='coundown' type='text' value={gameData.countdown} />
                    </div>
                    <div>
                        <label for='duration'>Default song duration:</label>
                        <input id='duration-input' name='duration' type='text' value={gameData.defaultDuration} />
                    </div>
                    <div>
                        <input id='autoReveal-input' name='autoReveal' type='checkbox' checked={gameData.autoReveal} />
                        <label for='autoReveal'>Auto Reveal Song Info after duration expires?</label>
                    </div>
                    <div>
                        <label for='gameType'>Metadata Labels</label>
                        <select id='gameType-input' onChange={e => { console.log(e.target.value); setGameType(e.target.value) }}>
                            <option value='game'>Use Composer/Game</option>
                            <option value='music'>Use Artist/Album</option>
                            <option value='both'>Use Both</option>
                        </select>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Categories and Songs</legend>
                    <table>
                        <thead>
                            <tr>
                                <th>delete</th>
                                <th>title</th>
                                {metadataTags()}
                                <th>year</th>
                                <th>sound file</th>
                                <th>start time</th>
                                <th>duration</th>
                                <th>album image</th>
                                <th>background image</th>
                            </tr>
                        </thead>
                        <DataTableRows gameData={gameData} gameType={gameType} />
                        <tfoot>
                            <tr>
                                <td>SAVE</td>
                                <td>AFTER</td>
                                <td>EDITING</td>
                            </tr>
                        </tfoot>
                    </table>
                </fieldset>
            </div>
        )
    }
}

async function saveData() {
    let saveObj = {}
    saveObj.autoReveal = $('#autoReveal-input').value
    saveObj.countdown = $('#countdown-input').value
    saveObj.defaultDuration = $('#duration-input').value
    saveObj.style = $('#gameType-input').value

    saveObj.music = []
    let rows = $$$('tbody tr')

    rows.forEach(row => {
        if (row.classList.contains("deleted")) {
            console.log('deleted')
            return
        }

        if (row.id == "category-header") {
            let category = $(row, '#tr-category-name').value
            let tileImg = $(row, '#tr-tile-img').value
            saveObj.music.push({
                'name': category,
                'tileImg': tileImg,
                'songs': []
            })
            return
        }

        let category = row.getAttribute('name')
        if (category == null) {
            return
        }

        let song = Song()
        song.title = $(row, '#tr-title').value
        song.composer = ""
        if ($(row, '#tr-composer')) {
            song.composer = $(row, '#tr-composer').value
        }
        song.game = ""
        if ($(row, '#tr-game-name')) {
            song.game = $(row, '#tr-game-name').value
        }
        song.artist = ""
        if ($(row, '#tr-artist')) {
            song.artist = $(row, '#tr-artist').value
        }
        song.album = ""
        if ($(row, '#tr-album')) {
            song.album = $(row, '#tr-album').value
        }
        song.year = $(row, '#tr-year').value
        song.soundFile = $(row, '#tr-sound-file').value
        song.startTime = $(row, '#tr-start-time').value
        song.duration = $(row, '#tr-duration').value
        song.backgroundImg = $(row, '#tr-background').value
        song.albumArtImg = $(row, '#tr-album').value
        // console.log(song)
        // console.log(row)
        saveObj.music.forEach(cat => {
            if (cat.name == row.getAttribute('name')) {
                console.log('adding', song.title, "to", cat.name)
                cat.songs.push(song)
            }
        })
        // saveObj.music[row.id]['songs'].push(song)
    })
    console.log(saveObj)
    await window.nodejs.call('writeFile', [`./games/${selectedGame}/data.json`, saveObj])
}

function keylogger(e) {
    if (e.ctrlKey && e.keyCode == 83) {  // ctrl + s
        saveData()
    }
}

export default function() {
    window.addEventListener('keydown', keylogger)
    render(DataViewer(), document.body)
}

//todo: DONE new category button
//      DONE data sanitization
//      DONE update song data type in helpers.js
//      DONE add duration
//      DONE scan folders for objs, update inputs with searchable dropdowns
//      DONE actually save file
//      DONE game/music industry mode
//      css