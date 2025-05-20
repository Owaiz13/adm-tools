FROM python:3.9-slim

# Install dependencies: wget, unzip, tar
RUN apt-get update && \
    apt-get install -y wget unzip tar && \
    rm -rf /var/lib/apt/lists/*

# Install OpenJDK 21 (Temurin)
RUN mkdir -p /opt/java && \
    wget -qO- https://api.adoptium.net/v3/binary/latest/21/ga/linux/x64/jdk/hotspot/normal/eclipse | tar xvz -C /opt && \
    ln -s /opt/jdk-21.* /opt/java/openjdk

ENV JAVA_HOME=/opt/java/openjdk
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Install Jadx 1.5.0
RUN wget https://github.com/skylot/jadx/releases/download/v1.5.0/jadx-1.5.0.zip && \
    unzip jadx-1.5.0.zip -d /opt/jadx && \
    rm jadx-1.5.0.zip

# Create working directories
WORKDIR /app
RUN mkdir -p /uploads /output

# Copy decompile script and tree generator
COPY decompile.sh /app/decompile.sh
COPY generate_json.py /app/generate_json.py

# Make decompile.sh executable
RUN chmod +x /app/decompile.sh

# Default command to run the decompile script
ENTRYPOINT ["/bin/bash", "/app/decompile.sh"]
