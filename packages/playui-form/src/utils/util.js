
export const _isTextMediaType = contentMediaType => contentMediaType && (
    contentMediaType.startsWith('text/')
    || contentMediaType === 'application/rtf'
    || contentMediaType === 'application/xml'
    || contentMediaType === 'application/xhtml+xml'
    || contentMediaType === 'application/json'
);

export const _isFileUpload = schema => {
    return schema.format === 'data-url' 
    || schema.contentEncoding === 'base64';
};