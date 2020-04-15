addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  try{
    // Fetch variants
    response = await fetch('https://cfw-takehome.developers.workers.dev/api/variants')  
    if(await response.ok){
      parsedResponse = await response.json()

      // get variant based upon cookie data
      index = getVariantIndex(request)  
      redirect = await fetch(parsedResponse.variants[index])
      redirect = new Response(redirect.body, redirect)

      // persist variant
      redirect.headers.set('set-cookie', 'variantIndex=' + index + '; Path=/; HttpOnly') 
      newRedirect = new HTMLRewriter().on('*', new ElementHandler()).transform(redirect)
      return newRedirect
    }
    throw "Fetch failed with code " + await response.status + ", " + await response.statusText
  }
  catch(e){

    // Display Error Message
    return new Response(e, {
      headers: { 'content-type': 'text/plain' },
    })
  }
}

function getVariantIndex(request){
  cookie = request.headers.get('Cookie')
  var index

  // Check if cookie exists
  if(cookie){
    var indexKey = 'variantIndex'
    varIndex = cookie.indexOf(indexKey)

    // Check if persistent value created
    if(varIndex > -1){
      varIndex = varIndex + indexKey.length + 1
      index = cookie.substring(varIndex, varIndex + 1)
    }
  }

  // Create new variant if no value found
  if(!index){
    index = Math.round(Math.random())
  }
  return index;
}

class ElementHandler {
  element(element) {
    if(element.tagName == 'title'){
      element.setInnerContent("Anshul Modh")
    }
    else if(element.getAttribute('id') == 'title'){
      element.setInnerContent("Cloudflare Rocks")
    }
    else if(element.getAttribute('id') == 'description'){
      element.replace('<img src="https://resize.hswstatic.com/w_907/gif/cairn.jpg" alt="ROCKS!" class="center"/>', 
      {html:true})
    }
    else if(element.getAttribute('id') == 'url'){
      element.setInnerContent("Great content just a click away")
      element.setAttribute('href', 'https://www.linkedin.com/in/anshulmodh')
    }
  }
}
