FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN sed -i "s#http://localhost:8090/ProjetMicroUseryahya#/ProjetMicroUseryahya#g" src/app/core/constants/api.constants.ts \
    && sed -i "s#http://localhost:9091/api#/api#g" src/app/core/constants/api.constants.ts \
    && sed -i "s#http://localhost:9091##g" src/app/core/constants/api.constants.ts \
    && sed -i "s#http://localhost:8093/reviews#/api/reviews#g" src/app/services/review.service.ts \
    && sed -i "s#ws://localhost:8093/ws/autocomplete#ws://localhost:4200/ws/autocomplete#g" src/app/modules/review/review.component.ts \
    && sed -i "s#http://localhost:8099/freelancerProject/mission#/freelancerProject/mission#g" src/app/services/mission.service.ts \
    && sed -i "s#http://localhost:8084/api/contracts#/api/contracts#g" src/app/services/contrat.service.ts \
    && sed -i "s#http://localhost:8085#/api/profile#g" src/app/portfolio/services/portfolio.service.ts \
    && sed -i "s#http://localhost:8085#/api/profile#g" src/app/portfolio/pages/portfolio-list/portfolio-list.component.ts \
    && sed -i "s#http://localhost:8090#/ProjetMicroUseryahya#g" src/app/core/constants/api.constants.ts
RUN npm run build -- --configuration=development --source-map=false --output-hashing=all

FROM nginx:alpine
COPY --from=build /app/dist/freelancers-plateforme-front/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
