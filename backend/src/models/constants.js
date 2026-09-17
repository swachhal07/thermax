/* The sector slugs are the contract between this API and the frontend: they
   match src/data/services.js, which supplies each sector's title, code and
   photograph. A record referencing anything else would render as a blank label
   on the site, so the models reject it outright. */
export const SECTORS = ['dams', 'bridges', 'roads', 'tunnels', 'restoration']

/* One shape for every stored image. `publicId` is what lets us delete the file
   from Cloudinary when the record changes or goes. */
export const IMAGE_SCHEMA_FIELDS = {
  url: { type: String, trim: true },
  publicId: { type: String, trim: true },
  width: Number,
  height: Number,
  format: String,
  bytes: Number,
}
