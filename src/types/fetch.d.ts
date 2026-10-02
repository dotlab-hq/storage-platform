// Streaming request bodies (upload progress, URL import) require
// `duplex: 'half'`, which TypeScript's DOM lib doesn't declare yet.
interface RequestInit {
  duplex?: 'half'
}
