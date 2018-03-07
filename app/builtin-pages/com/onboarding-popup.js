import * as yo from 'yo-yo'

// globals
// =

let currentStep = 0
let isHintHidden = true
let defaultProtocolSettings
let resolve
let reject

const STEPS = [
  {
    title: 'Welcome to Beaker!',
    subtitle: 'Configure your preferences',
    description: 'Beaker is a new type of browser for exploring and building the peer-to-peer Web.',
    content: () => yo`
      <p>
        <label class="toggle">
          <input checked=${defaultProtocolSettings.dat} type="checkbox" onchange=${onToggleDefaultBrowser} />
          <div class="switch"></div>
          <span class="text">
            Set Beaker as the default browser for dat:// URLs
          </span>

          <button type="button" class="btn hint-btn plain link" onclick=${onShowHint}>
            <i class="fa fa-question-circle-o"></i>
          </button>
        </label>


        <div class="onboarding-hint ${isHintHidden ? 'hidden' : ''}">
          dat:// is the peer-to-peer protocol protocol that Beaker uses to host websites
        </div>
      </p>`,
    color: 'blue',
    onLeave: async () => {
      if (defaultProtocolSettings.dat) {
        await beaker.browser.setAsDefaultProtocolClient('dat')
      } else {
        await beaker.browser.removeAsDefaultProtocolClient('dat')        
      }
    }
  },
  {
    title: 'Build and host websites',
    subtitle: 'Configure your workspace settings',
    description: 'With Beaker, you can create and host websites from your computer. No server required!',
    content: () => yo`
      <div>
        <p>
          The default directory where your websites will be saved:
        </p>

        <p class="path-container">
          <input disabled class="path nofocus" name="path" value="/Users/tara/src/butt" />

          <button class="btn primary nofocus" onclick=${onSelectDirectory}>
            Choose different directory
          </button>
        </p>
      </div>`,
    color: 'pink',
  },
  {
    title: 'Get started',
    subtitle: 'Start exploring the peer-to-peer Web',
    description: '',
    content: () => yo`
      <p>
        <a href="#todo" class="module">
          <img src="beaker://assets/img/onboarding/create-website.svg"/>

          <span>
            <h3 class="module-heading">
              Create a peer-to-peer website
              <i class="fa fa-angle-right"></i>
            </h3>

            <p>
              Create your first peer-to-peer website using one of our templates.
            </p>
          </span>
        </a>

        <a href="#todo" class="module">
          <img src="beaker://assets/img/onboarding/community.svg"/>

          <span>
            <h3 class="module-heading">
              See what others have built
              <i class="fa fa-angle-right"></i>
            </h3>

            <p>
              Explore websites, apps, and tools built with Beaker and dat://.
            </p>
          </span>
        </a>

        <a href="#todo" class="module">
          <img src="beaker://assets/img/onboarding/documentation.svg"/>

          <span>
            <h3 class="module-heading">
              Learn more
              <i class="fa fa-angle-right"></i>
            </h3>

            <p>
              Explore Beaker${"'"}s documentation and tutorials
            </p>
          </span>
        </a>
      </p>`,
    color: 'green',
  }
]

// exported api
// =

export async function create (opts = {}) {
  // localFilesPath = opts.defaultPath || ''
  defaultProtocolSettings = await beaker.browser.getDefaultProtocolSettings()

  // render interface
  var popup = render()
  document.body.appendChild(popup)
  document.addEventListener('keyup', onKeyUp)

  // return promise
  return new Promise((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })
}

export function destroy () {
  localStorage.hasDismissedOnboarding = true
  var popup = document.getElementById('onboarding-popup')
  document.body.removeChild(popup)
  document.removeEventListener('keyup', onKeyUp)
  reject()
}

// internal methods
// =

function update () {
  yo.update(document.getElementById('onboarding-popup'), render())
}

function render () {
  const step = STEPS[currentStep]

  return yo`
    <div id="onboarding-popup" class="popup-wrapper ${step.color} step-${currentStep}" onclick=${onClickWrapper}>
      <div class="popup-inner">
        ${renderHead()}
        ${renderBody()}
        ${renderFooter()}
      </div>
    </div>`
}

function renderHead () {
  const step = STEPS[currentStep]

  return yo`
    <div class="head onboarding-header">
      <button class="btn close-btn plain" onclick=${destroy}>
        <i class="fa fa-times"></i>
      </button>

      <i class="icon fa fa-link"></i>
      <i class="icon fa fa-file"></i>
      <i class="icon fa fa-font"></i>
      <i class="icon fa fa-i-cursor"></i>
      <i class="icon fa fa-cubes"></i>
      <i class="icon fa fa-align-left"></i>

      <h1 class="title">
        ${step.title}
      </h1>

      <h2 class="subtitle">
        ${step.subtitle}
      </h2>
    </div>`
}

function renderBody () {
  const step = STEPS[currentStep]

  return yo`
    <div class="body onboarding-body">
      ${step.description && step.description.length
        ? yo`
          <p class="description">
            ${step.description}
          </p>`
        : ''
      }

      ${step.content()}
    </div>`
}

function renderFooter () {
  return yo`
    <div class="footer">
      ${currentStep !== 0
        ? yo`
          <button class="btn nofocus" onclick=${onClickPrevious}>
            <i class="fa fa-angle-double-left"></i>
            <span>Previous</span>
          </button>`
        : ''
      }

      <div class="progress-indicator">
        ${STEPS.map((step, i) => yo`<div class="step ${currentStep === i ? 'active' : ''}"></div>`)}
      </div>

      ${currentStep === STEPS.length - 1
        ? ''
        : yo`
          <button class="btn nofocus" onclick=${onClickNext}>
            <span>Next</span>
            <i class="fa fa-angle-double-right"></i>
          </button>`
      }
    </div>
  </div>`
}

// event handlers
// =

function onKeyUp (e) {
  e.preventDefault()
  e.stopPropagation()

  if (e.keyCode === 27) {
    destroy()
  }
}

function onClickWrapper (e) {
  if (e.target.id === 'onboarding-popup') {
    destroy()
  }
}

function onClickPrevious () {
  currentStep = currentStep - 1
  isHintHidden = true
  update()
}

async function onClickNext () {
  // run any effects
  if (STEPS[currentStep].onLeave) {
    await STEPS[currentStep].onLeave()
  }

  // go to next step
  currentStep = currentStep + 1
  isHintHidden = true
  update()
}

function onShowHint (e) {
  e.stopPropagation()
  e.preventDefault()
  isHintHidden = !isHintHidden
  // TODO because the popup is now fixed height, the hint is causing layout issues
  update()
}

function onToggleDefaultBrowser (e) {
  e.preventDefault()
  defaultProtocolSettings.dat = !defaultProtocolSettings.dat
  update()
}

async function onSelectDirectory (e) {
  e.preventDefault()
  e.stopPropagation()

  let path = await beaker.browser.showOpenDialog({
    title: 'Select a folder',
    buttonLabel: 'Select folder',
    properties: ['openDirectory', 'createDirectory']
    // defaultPath: localFilesPath TODO
  })

  // TODO
  // if (path) {
  //   localFilesPath = path[0]
  //   update()
  // }
}
