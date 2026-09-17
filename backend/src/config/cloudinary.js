import { v2 as cloudinary } from 'cloudinary'
import { env } from './env.js'
import { ApiError } from '../utils/ApiError.js'

if (env.cloudinary.configured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  })
}

const assertConfigured = () => {
  if (!env.cloudinary.configured) {
    throw new ApiError(
      503,
      'Image storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
    )
  }
}

/* One shape for every stored image, so a record only ever holds what the
   frontend needs to render it plus the public_id needed to delete it. */
const toAsset = (result) => ({
  url: result.secure_url,
  publicId: result.public_id,
  width: result.width,
  height: result.height,
  format: result.format,
  bytes: result.bytes,
})

/* Uploads sit in memory (multer memoryStorage) so nothing touches disk — this
   runs fine on a read-only filesystem. `folder` is namespaced under
   CLOUDINARY_FOLDER; `publicId` is the slug, so re-uploading an image for the
   same record overwrites it rather than accumulating orphans. */
export async function uploadBuffer(buffer, { folder, publicId, tags = [] }) {
  assertConfigured()

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: [env.cloudinary.folder, folder].filter(Boolean).join('/'),
        public_id: publicId,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
        tags,
        // Strip metadata and let Cloudinary pick the format and quality it
        // serves best — the site asks for webp and gets it without us storing
        // a second derivative.
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => (error ? reject(error) : resolve(toAsset(result))),
    )

    stream.end(buffer)
  })
}

/* Deletion is best-effort by design: a record whose image is already gone from
   Cloudinary should still delete cleanly here. */
export async function destroyAsset(publicId) {
  if (!publicId || !env.cloudinary.configured) return false

  try {
    const result = await cloudinary.uploader.destroy(publicId, { invalidate: true })
    return result.result === 'ok'
  } catch (error) {
    console.warn(`[cloudinary] could not delete ${publicId}: ${error.message}`)
    return false
  }
}

export { cloudinary }
