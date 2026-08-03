export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const BlogPartsFragmentDoc = gql`
    fragment BlogParts on Blog {
  __typename
  title
  date
  summary
  description
  tags
  draft
  images
  authors
  layout
  canonicalUrl
  body
}
    `;
export const GuidePartsFragmentDoc = gql`
    fragment GuideParts on Guide {
  __typename
  title
  date
  summary
  description
  tags
  draft
  body
}
    `;
export const AnalysePartsFragmentDoc = gql`
    fragment AnalyseParts on Analyse {
  __typename
  title
  date
  summary
  description
  tags
  draft
  body
}
    `;
export const AuthorsPartsFragmentDoc = gql`
    fragment AuthorsParts on Authors {
  __typename
  name
  avatar
  occupation
  company
  email
  twitter
  linkedin
  github
  body
}
    `;
export const BlogDocument = gql`
    query blog($relativePath: String!) {
  blog(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...BlogParts
  }
}
    ${BlogPartsFragmentDoc}`;
export const BlogConnectionDocument = gql`
    query blogConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: BlogFilter) {
  blogConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...BlogParts
      }
    }
  }
}
    ${BlogPartsFragmentDoc}`;
export const GuideDocument = gql`
    query guide($relativePath: String!) {
  guide(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...GuideParts
  }
}
    ${GuidePartsFragmentDoc}`;
export const GuideConnectionDocument = gql`
    query guideConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: GuideFilter) {
  guideConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...GuideParts
      }
    }
  }
}
    ${GuidePartsFragmentDoc}`;
export const AnalyseDocument = gql`
    query analyse($relativePath: String!) {
  analyse(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...AnalyseParts
  }
}
    ${AnalysePartsFragmentDoc}`;
export const AnalyseConnectionDocument = gql`
    query analyseConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: AnalyseFilter) {
  analyseConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...AnalyseParts
      }
    }
  }
}
    ${AnalysePartsFragmentDoc}`;
export const AuthorsDocument = gql`
    query authors($relativePath: String!) {
  authors(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...AuthorsParts
  }
}
    ${AuthorsPartsFragmentDoc}`;
export const AuthorsConnectionDocument = gql`
    query authorsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: AuthorsFilter) {
  authorsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...AuthorsParts
      }
    }
  }
}
    ${AuthorsPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    blog(variables, options) {
      return requester(BlogDocument, variables, options);
    },
    blogConnection(variables, options) {
      return requester(BlogConnectionDocument, variables, options);
    },
    guide(variables, options) {
      return requester(GuideDocument, variables, options);
    },
    guideConnection(variables, options) {
      return requester(GuideConnectionDocument, variables, options);
    },
    analyse(variables, options) {
      return requester(AnalyseDocument, variables, options);
    },
    analyseConnection(variables, options) {
      return requester(AnalyseConnectionDocument, variables, options);
    },
    authors(variables, options) {
      return requester(AuthorsDocument, variables, options);
    },
    authorsConnection(variables, options) {
      return requester(AuthorsConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "http://localhost:4001/graphql",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
