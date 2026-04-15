import Nom_Tags from '../entities/Nom_tags.js';

async function getTags() {
    return await Nom_Tags.findAll();
}

export {
    getTags
}