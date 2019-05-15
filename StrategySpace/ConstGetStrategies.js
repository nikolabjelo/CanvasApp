const GRAPHQL_QUERY_GET_STRATEGIES = Apollo.gql`
    query($fbSlug: String!){

              strategizer_StrategyByFb(fbSlug: $fbSlug){
              id
              subStrategies(activeOnly: true){
                  name
                  active
                  entryPoint{
                  situations{
                      name
                      conditions{
                      name
                      code
                      }
                  }
                  }
                  exitPoint{
                  situations{
                      name
                      conditions{
                      name
                      code
                      }
                  }
                  }
                  sellPoint{
                  situations{
                      name
                      conditions{
                      name
                      code
                      }
                  }
                  }
                  buyPoint{
                  situations{
                      name
                      conditions{
                      name
                      code
                      }
                  }
                  }
                  stopLoss{
                  phases{
                      name
                      code
                      situations{
                      name
                      conditions{
                          name
                          code
                      }
                      }
                  }
                  }
                  buyOrder{
                  phases{
                      name
                      code
                      situations{
                      name
                      conditions{
                          name
                          code
                      }
                      }
                  }
                  }
                  sellOrder{
                  phases{
                      name
                      code
                      situations{
                      name
                      conditions{
                          name
                          code
                      }
                      }
                  }
                  }
              }
              }
          }
        `
