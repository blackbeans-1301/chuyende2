import { Dropbox } from "dropbox"
import fetch from "isomorphic-fetch"

// const
const APP_KEY = "ko9sm0h2o0yqjik"
const APP_SECRET = "hfw0dv9247e96x1"

const dbx = new Dropbox({
  accessToken: "sl.BTk5epbAjc1G7IE8gqtfvtN7SjnNPcEJ86LJJ1wQSLyknroupWvqNO_uHYNmuDla8Fp0yByy4YttPX-VPTtVkCHClFZakY3ZnHKuKxrQxwtA47ktoH5HFX9S2FEA0HCi-IHaL7ZSJ6_r",
  fetch
})



const state = {
  files: [],
  rootPath: ''
}

const fileListElem = document.querySelector('.js-file-list')
const loadingElem = document.querySelector('.js-loading')
const pathInput = document.querySelector('.js-path-input')
const submitButton = document.querySelector('.js-button-submit')
const createFolderPath = document.querySelector('.js-create-folder-input')
const createFolderButton = document.querySelector('.js-create-folder')
const uploadForm = document.querySelector('.js-file-upload-form')
const file = document.querySelector('.js-file-chosen')



submitButton.addEventListener('click', e => {
  e.preventDefault()
  console.log(pathInput.value)
  state.rootPath = pathInput.value === '/' ? '' : pathInput.value.toLowerCase()
  state.files = []
  init()
})

const init = async () => {
  // authorize()
  const res = await dbx.filesListFolder(
    { path: state.rootPath, limit: 5 }
  )
  updateFiles(res.result.entries)
  console.log(res)

  if (res.result.has_more) {
    loadingElem.classList.remove('hidden')
    await getMoreFiles(res.result.cursor, more => {
      updateFiles(more.result.entries)
    })
    loadingElem.classList.add('hidden')
  } else {
    loadingElem.classList.add('hidden')
  }

  createFolderButton.addEventListener('submit', async () => {
    const path = createFolderPath.value
    console.log(`${state.rootPath === '' ? '' : `/${state.rootPath}`}/${path}`)
    const res = await dbx.filesCreateFolderV2({ autorename: false, path: `${state.rootPath === '' ? '' : `/${state.rootPath}`}/${path}` })
  })

  uploadForm.addEventListener('submit', async e => {
    e.preventDefault()
    const files = file.value
    console.log(files)

    // fs.readFile(files
    // const res = await dbx.filesUpload({
    //   autorename: false,
    //   mode: "add",
    //   mute: false,
    //   path: `${state.rootPath === '' ? '' : `/${state.rootPath}`}/${path}/${files}`,
    // })

  })
}

const getMoreFiles = async (cursor, callback) => {
  console.log(cursor)
  const res = await dbx.filesListFolderContinue({
    cursor: cursor
  })
  if (callback) callback(res)
  if (res.result.has_more) {
    await getMoreFiles(res.result.cursor, more => {
      updateFiles(more.result.entries)
    })
  }
}

const updateFiles = files => {
  state.files = [...state.files, ...files]
  renderFiles()
  getThumbnails(state.files)
}


const renderFiles = () => {
  fileListElem.innerHTML = state.files.sort((a, b) => {
    if ((a['.tag'] === 'folder' || b['.tag'] === 'folder') && !(a['.tag'] === b['.tag'])) {
      return a['.tag'] === 'folder' ? -1 : 1
    } else {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
    }
  }).map(file => {
    const type = file['.tag']
    let thumbnail
    if (type === 'file') {
      thumbnail = file.thumbnail
        ? `data:image/jpeg;base64, ${file.thumbnail}`
        : `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAbFBMVEX///8AcrwAcLtHicUAa7kfeL+evN0AZrjm7fYme79Dh8UAbbqCqtTx9/tlmcwAZ7iNuNyZv9/S5PJTlswAdb6tzueHstmJtdmiyOT2+vxxptNjnM640+nb6vTD2+2ew+EsgsM+jsh2q9bM4PDEaJeNAAADIElEQVR4nO3djVIaMRSG4WyMVZviIn8KKvhz//dYaKczK3Q69JB8JzDvewHOecy67OJCQiAiIiIiIiIiorNrNF/8qNfj02Tp67td5ZRyvVLqZ89PIz/gS5diV7mY+7yaOAHn9X1/kFMX42unAe7K/crhWJ1mGXBnnK3VwEnWLeGu2G/EwnGSAnfEB61Qe5D+Sky80h6kv4njSxd2SUl0EUYlcSiMNwX7529OSRwI43UYFWt5PyTm/TO2kDhcw+uSP/h+cJLul+MueRE1wu392cqLqBIeXluoiDphGPfRgygUblfRg6gU+hClQheiVuhBFAsPiPXvNNRCPVEulBP1QjXRQSgmegi1RBehlOgjVBKdhNvL8E5E9BIevlFbi+gmlK2in1BFdBSKiJ7CML7ZJ1a403AVSoi+QgXRWfgXYum/RW/hATGmeckxGhAeEmevJedoQHjwopGnJedoQXhATC8lB2lBuE+MbyUHaUK4fxle9GTThnDvfxrxquAgjQi/rmLMn+UGaUUYPobE9FFukGaEy7fhEwV35QZpRhjmg0WMsdxTjO0Iw3ARC55NJcJ4f0x3g1HyqtggEmF31MPSX14v3osNohH+dwVPNQjNPV+88LRHc89BOLl44fL9lOc6z0EY1qd8juMshGGx/5b2xQnDh514JsIw75Lx4xznItwap93Rz033dW6fKguts1yo8DtCUwiVIbSFUBlCWwiVIbSFUBlCWwiVIbSFUBlCWwiVIbSFUBlCWwiVIbSFUBlCWwiVIbSFUBlCWwiVIbSFUBlCWwiVIbSFUBlCWwiVIbSFUBlCWwiVIbSFUBlCWwiVIbSFUBlCWwiVIbSFUBlCWwiVIbSFUBlCWwiVIbSFUBlCWwiVIbSFUBlCWwiVIbSFUBlCWwiVVRfG69GtZ6P6axiP/mLqOg1HqSNsKIQIB01P2iylWgX3Cno4aSuRauVFMeFrbPEwLbp53nOLi5jLHaQh3M7aW8QYi24ne9J+MFWKZbdaDeFz1pQxprwuCwxh+Rj71Ep9WoxKA3etN9/aaFN8/YiIiIiIiIiIiIiImu8nLxlgZucNieQAAAAASUVORK5CYII=`
    } else {
      thumbnail = `https://www.elevenforum.com/data/attachments/25/25857-b392b57fec12a1e151c4689cba35b02d.jpg`
    }
    return `
    <li class="dbx-list-item ${type}" style="margin: 5px; padding: 2px; border-bottom: 1px solid black; display: flex; justify-content: space-between">
      <div><img class="dbx-thumbnail" src="${thumbnail}" style="width: 30px; height: 30px"/>
    <span class="js-file-name">${file.name}</span></div>
    <div>
    <i class="fa fa-download js-download-button" style="margin-right: 20px; height: 32px; cursor: pointer"></i>
    <i class="fa fa-link js-share-button" style="margin-right: 20px; height: 32px; cursor: pointer"></i>
    </div>
    </li>
    `
  }).join('')

  createSharedLink()
  createDownloadLink()
}

const createSharedLink = () => {
  const listItem = document.querySelectorAll('.dbx-list-item')
  listItem.forEach(async (item) => {
    const shareButton = item.querySelector('.js-share-button')
    shareButton.addEventListener('click', async () => {
      const fileName = item.querySelector('.js-file-name').innerHTML
      const fileUrl = await dbx.sharingCreateSharedLink({ path: `/${state.rootPath}${fileName.toLowerCase()}`, short_url: true })
      console.log(fileUrl.result.url)
      await navigator.clipboard.writeText(fileUrl.result.url)
      alert(`Link to ${fileName} has copied to clipboard`)
    })
  })
}

const createDownloadLink = () => {
  console.log("create download")
  const listItem = document.querySelectorAll('.dbx-list-item')
  listItem.forEach((item) => {
    const fileName = item.querySelector('.js-file-name').innerHTML
    const downloadButton = item.querySelector('.js-download-button')
    downloadButton.addEventListener('click', async () => {
      const fileUrl = await dbx.filesGetTemporaryLink({ path: `/${state.rootPath}${fileName.toLowerCase()}` })
      console.log(fileUrl.result.link)
      window.location.assign(fileUrl.result.link)
      // await navigator.clipboard.writeText(fileUrl.result.link)
    })
  })
}

const getThumbnails = async files => {
  const paths = files.filter(file => file['.tag'] === "file").map(file => ({
    path: file.path_lower,
    size: 'w32h32'
  }))
  console.log(paths)

  const res = await dbx.filesGetThumbnailBatch({
    entries: paths
  })


  const newStateFiles = [...state.files]

  res.result.entries.forEach(file => {
    let indexToUpdate = state.files.findIndex(
      stateFile => file.metadata.path_lower === stateFile.path_lower
    )

    newStateFiles[indexToUpdate].thumbnail = file.thumbnail
  })

  state.files = newStateFiles
  renderFiles()
}

init()