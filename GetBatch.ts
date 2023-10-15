/**
 * Gets multiple documents.
 */
class GetBatch {
  #documents: string[] = [];

  /**
   * A container for multiple reads
   * @param {Firestore} _firestore the parent instance
   */
  constructor(private readonly _firestore: Firestore) {}

  /**
   * Add a document to the retrive list
   * @param {string|string[]} docPath One or multiple documents to fetch
   * @returns This `WriteBatch` instance. Used for chaining method calls.
   */
  add(docPath: string | string[]): GetBatch {
    if (typeof docPath === 'string') this.#documents.push(docPath);
    else docPath.forEach((docPath) => this.#documents.push(docPath));
    return this;
  }

  /**
   * Get the requested documents
   * @param {string[]} mask Field mask for document read, applies to all documents
   * @returns {Document[]} The found files only
   */
  get(mask?: string[]): Document[] {
    const request = new Request(this._firestore.baseUrl, this._firestore.authToken);
    request.route('batchGet');

    const payload: FirestoreAPI.BatchGetDocumentsRequest = {
      documents: this.#documents.map((doc) => this._firestore.basePath + doc),
      mask: mask && { fieldPaths: mask },
    };
    const responseObj = request.post<FirestoreAPI.BatchGetDocumentsResponse[]>(undefined, payload);

    // Filter out results without documents and unwrap document fields
    const documents = responseObj.reduce((docs: Document[], docItem: FirestoreAPI.BatchGetDocumentsResponse) => {
      if (docItem.found) {
        const doc = new Document(docItem.found, { readTime: docItem.readTime } as Document);
        docs.push(doc);
      }
      return docs;
    }, []);

    return documents;
  }
}
